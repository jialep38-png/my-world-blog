import { createWithBase } from '../utils/format';

const dialog = document.getElementById('bits-draft-dialog') as HTMLDialogElement | null;
const openBtn = document.querySelector<HTMLButtonElement>('[data-new-bit]');
const defaultAuthorName = (dialog?.dataset.defaultAuthorName ?? '').trim();
const defaultAuthorAvatar = (dialog?.dataset.defaultAuthorAvatar ?? '').trim();

const form = dialog?.querySelector<HTMLFormElement>('[data-bits-draft-form]') ?? null;
const closeBtns = dialog?.querySelectorAll<HTMLElement>('[data-bits-draft-close]') ?? [];
const generateBtn = dialog?.querySelector<HTMLButtonElement>('[data-bits-draft-generate]') ?? null;
const downloadBtn = dialog?.querySelector<HTMLButtonElement>('[data-bits-draft-download]') ?? null;
const statusEl = dialog?.querySelector<HTMLElement>('[data-bits-draft-status]') ?? null;
const manualOpenBtn = dialog?.querySelector<HTMLButtonElement>('[data-bits-manual-open]') ?? null;
const manualBox = dialog?.querySelector<HTMLElement>('[data-bits-manual]') ?? null;
const manualTextarea = dialog?.querySelector<HTMLTextAreaElement>('[data-bits-manual-textarea]') ?? null;
const manualNote = dialog?.querySelector<HTMLElement>('[data-bits-manual-note]') ?? null;
const manualCopyBtn = dialog?.querySelector<HTMLButtonElement>('[data-bits-manual-copy]') ?? null;
const toolbar = dialog?.querySelector<HTMLElement>('[data-bits-draft-toolbar]') ?? null;
const quoteBtn = toolbar?.querySelector<HTMLButtonElement>('[data-action="quote"]') ?? null;
const listBtn = toolbar?.querySelector<HTMLButtonElement>('[data-action="list"]') ?? null;
const boldBtn = toolbar?.querySelector<HTMLButtonElement>('[data-action="bold"]') ?? null;
const italicBtn = toolbar?.querySelector<HTMLButtonElement>('[data-action="italic"]') ?? null;
const codeBtn = toolbar?.querySelector<HTMLButtonElement>('[data-action="code"]') ?? null;
const linkBtn = toolbar?.querySelector<HTMLButtonElement>('[data-action="link"]') ?? null;

const contentEl = dialog?.querySelector<HTMLTextAreaElement>('#bits-draft-content') ?? null;
const tagsEl = dialog?.querySelector<HTMLInputElement>('#bits-draft-tags') ?? null;
const placeEl = dialog?.querySelector<HTMLInputElement>('#bits-draft-place') ?? null;
const authorNameEl = dialog?.querySelector<HTMLInputElement>('[data-author-name]') ?? null;
const authorAvatarEl = dialog?.querySelector<HTMLInputElement>('[data-author-avatar]') ?? null;
const identityDetails = dialog?.querySelector<HTMLDetailsElement>('[data-identity-details]') ?? null;
const identityBar = dialog?.querySelector<HTMLElement>('[data-identity-bar]') ?? null;
const identityPill = dialog?.querySelector<HTMLButtonElement>('[data-identity-pill]') ?? null;
const identityNew = dialog?.querySelector<HTMLButtonElement>('[data-identity-new]') ?? null;
const identityNameEl = dialog?.querySelector<HTMLElement>('[data-identity-name]') ?? null;
const identityAvatarEl = dialog?.querySelector<HTMLElement>('[data-identity-avatar]') ?? null;
const authorResetBtn = dialog?.querySelector<HTMLButtonElement>('[data-author-reset]') ?? null;
const imagesWrap = dialog?.querySelector<HTMLElement>('[data-bits-images]') ?? null;
const imageAddBtn = dialog?.querySelector<HTMLButtonElement>('[data-bits-image-add]') ?? null;
const imageTemplate = dialog?.querySelector<HTMLTemplateElement>('[data-bits-image-template]') ?? null;
const draftEl = dialog?.querySelector<HTMLInputElement>('#bits-draft-draft') ?? null;

const pad2 = (value: number) => String(value).padStart(2, '0');
const base = import.meta.env.BASE_URL ?? '/';
const withBase = createWithBase(base);
const formatDateLocal = () => {
  const d = new Date();
  const tzMinutes = -d.getTimezoneOffset();
  const sign = tzMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(tzMinutes);
  const tzH = pad2(Math.floor(abs / 60));
  const tzM = pad2(abs % 60);
  const datePart = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const timePart = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  return `${datePart}T${timePart}${sign}${tzH}:${tzM}`;
};

const formatFileStamp = () => {
  const d = new Date();
  const datePart = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const timePart = `${pad2(d.getHours())}${pad2(d.getMinutes())}`;
  return `${datePart}-${timePart}`;
};

const setStatus = (text: string, tone: 'info' | 'error' | 'success' = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.setAttribute('data-tone', tone);
};

const clearStatus = () => {
  if (!statusEl) return;
  statusEl.textContent = '';
  statusEl.removeAttribute('data-tone');
};

let lastMarkdown = '';
let hasGenerated = false;
let lastEditSource: 'typing' | 'toolbar' = 'typing';
let isApplyingToolbar = false;
const toolbarUndoStack: Array<{ value: string; start: number; end: number }> = [];

const updateManualLink = () => {
  if (!manualOpenBtn) return;
  const hasContent = !!contentEl?.value.trim();
  manualOpenBtn.hidden = !(hasGenerated || hasContent);
};

const focusTextarea = () => {
  contentEl?.focus();
};

const pushToolbarUndo = () => {
  if (!contentEl) return;
  const start = contentEl.selectionStart ?? 0;
  const end = contentEl.selectionEnd ?? 0;
  toolbarUndoStack.push({ value: contentEl.value, start, end });
  if (toolbarUndoStack.length > 50) toolbarUndoStack.shift();
};

const applyToolbarAction = (fn: () => void) => {
  if (!contentEl) return;
  pushToolbarUndo();
  isApplyingToolbar = true;
  fn();
  isApplyingToolbar = false;
  lastEditSource = 'toolbar';
  updateToolbarActive();
  updateManualLink();
};

const getLineAtCursor = () => {
  if (!contentEl) return { line: '', lineStart: 0, lineEnd: 0 };
  const value = contentEl.value;
  const cursor = contentEl.selectionStart ?? 0;
  const lineStart = value.lastIndexOf('\n', cursor - 1) + 1;
  const lineEndIndex = value.indexOf('\n', cursor);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const line = value.slice(lineStart, lineEnd);
  return { line, lineStart, lineEnd };
};

const isWrappedBy = (before: string, after: string, start: number, end: number) => {
  if (!contentEl) return false;
  const value = contentEl.value;
  const left = value.lastIndexOf(before, start);
  if (left === -1) return false;
  const right = value.indexOf(after, end);
  if (right === -1 || right <= left) return false;
  return left + before.length <= start && end <= right;
};

const findSingleStarBefore = (value: string, index: number) => {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (value[i] !== '*') continue;
    if (value[i - 1] === '*' || value[i + 1] === '*') continue;
    return i;
  }
  return -1;
};

const findSingleStarAfter = (value: string, index: number) => {
  for (let i = index; i < value.length; i += 1) {
    if (value[i] !== '*') continue;
    if (value[i - 1] === '*' || value[i + 1] === '*') continue;
    return i;
  }
  return -1;
};

const isInsideSingleStar = (start: number, end: number) => {
  if (!contentEl) return false;
  const value = contentEl.value;
  const left = findSingleStarBefore(value, start);
  if (left === -1) return false;
  const right = findSingleStarAfter(value, end);
  if (right === -1 || right <= left) return false;
  return left + 1 <= start && end <= right;
};

const isInsideLink = (start: number, end: number) => {
  if (!contentEl) return false;
  const value = contentEl.value;
  const left = value.lastIndexOf('[', start);
  if (left === -1) return false;
  const mid = value.indexOf('](', left);
  if (mid === -1) return false;
  const right = value.indexOf(')', mid);
  if (right === -1) return false;
  return start >= left + 1 && end <= right;
};

const updateToolbarActive = () => {
  if (!contentEl) return;
  const { line } = getLineAtCursor();
  const start = contentEl.selectionStart ?? 0;
  const end = contentEl.selectionEnd ?? 0;
  const boldActive = isWrappedBy('**', '**', start, end);
  const italicActive = !boldActive && isInsideSingleStar(start, end);
  const codeActive = isWrappedBy('`', '`', start, end);
  const linkActive = isInsideLink(start, end);
  const quoteActive = /^\s*>\s?/.test(line);
  const listActive = /^\s*[-*+]\s+/.test(line);

  boldBtn?.classList.toggle('is-active', boldActive);
  italicBtn?.classList.toggle('is-active', italicActive);
  codeBtn?.classList.toggle('is-active', codeActive);
  linkBtn?.classList.toggle('is-active', linkActive);
  quoteBtn?.classList.toggle('is-active', quoteActive);
  listBtn?.classList.toggle('is-active', listActive);
};

const wrapSelection = (before: string, after: string, placeholder: string) => {
  if (!contentEl) return;
  focusTextarea();
  const start = contentEl.selectionStart ?? 0;
  const end = contentEl.selectionEnd ?? 0;
  const hasSelection = start !== end;
  const selected = hasSelection ? contentEl.value.slice(start, end) : placeholder;
  const next = `${before}${selected}${after}`;
  contentEl.setRangeText(next, start, end, 'select');
  const innerStart = start + before.length;
  const innerEnd = innerStart + selected.length;
  contentEl.setSelectionRange(innerStart, innerEnd);
  focusTextarea();
};

const insertText = (text: string) => {
  if (!contentEl) return;
  focusTextarea();
  const start = contentEl.selectionStart ?? 0;
  const end = contentEl.selectionEnd ?? 0;
  contentEl.setRangeText(text, start, end, 'end');
  focusTextarea();
};

const prefixLines = (prefix: string) => {
  if (!contentEl) return;
  focusTextarea();
  const value = contentEl.value;
  const start = contentEl.selectionStart ?? 0;
  const end = contentEl.selectionEnd ?? 0;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEndIndex = value.indexOf('\n', end);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const segment = value.slice(lineStart, lineEnd);
  const lines = segment.split('\n');
  const prefixed = lines
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
    .join('\n');
  contentEl.setRangeText(prefixed, lineStart, lineEnd, 'select');
  contentEl.setSelectionRange(lineStart, lineStart + prefixed.length);
  focusTextarea();
};

const rememberMarkdown = (markdown: string) => {
  hasGenerated = true;
  lastMarkdown = markdown;
  updateManualLink();
};

const hideManualCopy = () => {
  if (manualBox) manualBox.hidden = true;
  if (manualTextarea) manualTextarea.value = '';
  if (manualNote) manualNote.textContent = '';
  manualOpenBtn?.setAttribute('aria-expanded', 'false');
  manualOpenBtn?.classList.remove('is-open');
};

const showManualCopy = (text: string, message: string) => {
  if (!manualBox || !manualTextarea) return;
  manualTextarea.value = text;
  manualBox.hidden = false;
  if (manualNote) manualNote.textContent = message;
  manualOpenBtn?.setAttribute('aria-expanded', 'true');
  manualOpenBtn?.classList.add('is-open');
  window.setTimeout(() => {
    manualTextarea.focus();
    manualTextarea.select();
  }, 0);
};

const parseTags = (raw: string) => {
  const parts = raw
    .split(/[,\s，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
};

const normalizeTagInput = (value: string) => {
  return value.replace(/，/g, ',').replace(/\s{2,}/g, ' ');
};

let isComposingTags = false;
const normalizeTagsField = () => {
  if (!tagsEl) return;
  const before = tagsEl.value;
  const normalized = normalizeTagInput(before);
  if (normalized === before) return;
  const start = tagsEl.selectionStart ?? normalized.length;
  const end = tagsEl.selectionEnd ?? normalized.length;
  const beforeStart = normalizeTagInput(before.slice(0, start));
  const beforeEnd = normalizeTagInput(before.slice(0, end));
  tagsEl.value = normalized;
  tagsEl.setSelectionRange(beforeStart.length, beforeEnd.length);
};

const formatTag = (value: string) => {
  const needsQuotes = /[:#\n\r\t]|^\s|\s$|^-/.test(value);
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '\\"')}"`;
};

const normalizeImage = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  let normalized = trimmed.replace(/\\/g, '/');
  normalized = normalized.replace(/^\/+/, '');
  normalized = normalized.replace(/^public\//i, '');
  normalized = normalized.replace(/\.webp\.webp$/i, '.webp');
  return normalized;
};

const normalizeAuthorName = (value: string) => value.trim();
const normalizeAuthorAvatar = (value: string) => normalizeImage(value);

const resolveImageUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const baseNormalized = base.endsWith('/') ? base : `${base}/`;
  if (trimmed.startsWith(baseNormalized)) return trimmed;
  return withBase(trimmed.replace(/^\/+/, ''));
};

const resolveAuthorAvatarUrl = (value: string) => resolveImageUrl(value);

const setAuthorPlaceholders = () => {
  if (authorNameEl) {
    authorNameEl.placeholder = defaultAuthorName ? `默认：${defaultAuthorName}` : '默认：匿名';
  }
  if (authorAvatarEl) {
    authorAvatarEl.placeholder = defaultAuthorAvatar
      ? `默认：${defaultAuthorAvatar}`
      : '可填相对路径或绝对 URL（留空用默认头像）';
  }
};

const renderIdentityAvatar = (avatarSrc: string, letter: string) => {
  if (!identityAvatarEl) return;
  identityAvatarEl.innerHTML = '';
  if (!avatarSrc) {
    const span = document.createElement('span');
    span.textContent = letter;
    identityAvatarEl.appendChild(span);
    return;
  }
  const img = document.createElement('img');
  img.src = resolveAuthorAvatarUrl(avatarSrc);
  img.alt = '';
  img.decoding = 'async';
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    renderIdentityAvatar('', letter);
  });
  identityAvatarEl.appendChild(img);
};

const updateIdentityPill = () => {
  const overrideName = normalizeAuthorName(authorNameEl?.value ?? '');
  const overrideAvatar = normalizeAuthorAvatar(authorAvatarEl?.value ?? '');
  const nameForPill = overrideName || defaultAuthorName || '匿名';
  const isDefault = !overrideName && !overrideAvatar;
  const displayName = isDefault ? `${nameForPill}（当前）` : nameForPill;
  if (identityNameEl) identityNameEl.textContent = displayName;
  const avatarForPill = overrideAvatar || defaultAuthorAvatar;
  const letter = Array.from(nameForPill)[0] ?? '匿';
  renderIdentityAvatar(avatarForPill, letter);
};

const updateIdentityToggleState = () => {
  const isOpen = !!identityDetails?.open;
  if (identityBar) identityBar.classList.toggle('is-open', isOpen);
};

const toggleIdentityDetails = () => {
  if (!identityDetails) return;
  const nextOpen = !identityDetails.open;
  identityDetails.open = nextOpen;
  if (nextOpen) authorNameEl?.focus();
  updateIdentityToggleState();
};

const imageRowState = new WeakMap<HTMLElement, { lastValue: string; requestId: number }>();
const initializedImageRows = new WeakSet<HTMLElement>();

const getImageRows = () => Array.from(
  imagesWrap?.querySelectorAll<HTMLElement>('[data-bits-image-row]') ?? []
);

const getImageRowElements = (row: HTMLElement) => {
  const srcEl = row.querySelector<HTMLInputElement>('[data-bits-image-src]');
  const widthEl = row.querySelector<HTMLInputElement>('[data-bits-image-width]');
  const heightEl = row.querySelector<HTMLInputElement>('[data-bits-image-height]');
  const removeBtn = row.querySelector<HTMLButtonElement>('[data-bits-image-remove]');
  if (!srcEl || !widthEl || !heightEl || !removeBtn) return null;
  return { srcEl, widthEl, heightEl, removeBtn };
};

const getImageRowState = (row: HTMLElement) => {
  const existing = imageRowState.get(row);
  if (existing) return existing;
  const next = { lastValue: '', requestId: 0 };
  imageRowState.set(row, next);
  return next;
};

const syncImageRow = (row: HTMLElement) => {
  const els = getImageRowElements(row);
  if (!els) return;
  const hasImage = !!els.srcEl.value.trim();
  row.classList.toggle('has-image', hasImage);
  els.widthEl.disabled = !hasImage;
  els.heightEl.disabled = !hasImage;
  if (!hasImage) {
    els.widthEl.value = '';
    els.heightEl.value = '';
  }
};

const syncImageRows = () => {
  const rows = getImageRows();
  rows.forEach((row) => syncImageRow(row));
  imagesWrap?.classList.toggle('has-multiple', rows.length > 1);
};

const fillImageRowDimensions = (row: HTMLElement) => {
  const els = getImageRowElements(row);
  if (!els) return;
  const raw = els.srcEl.value.trim();
  const state = getImageRowState(row);
  if (!raw) {
    state.lastValue = '';
    return;
  }
  if (raw === state.lastValue) return;
  state.lastValue = raw;
  const resolved = resolveImageUrl(raw);
  if (!resolved) return;
  const requestId = ++state.requestId;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    if (requestId !== state.requestId) return;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) {
      setStatus('无法自动读取，请手动填写。');
      return;
    }
    els.widthEl.value = String(width);
    els.heightEl.value = String(height);
    setStatus(`已自动读取：${width}×${height}`);
  };
  img.onerror = () => {
    if (requestId !== state.requestId) return;
    setStatus('无法自动读取，请手动填写。');
  };
  img.src = resolved;
};

const removeImageRow = (row: HTMLElement) => {
  const rows = getImageRows();
  const els = getImageRowElements(row);
  if (!els) return;
  if (rows.length <= 1) {
    els.srcEl.value = '';
    els.widthEl.value = '';
    els.heightEl.value = '';
    syncImageRow(row);
    els.srcEl.focus();
    syncImageRows();
    return;
  }
  row.remove();
  syncImageRows();
};

const initImageRow = (row: HTMLElement) => {
  if (initializedImageRows.has(row)) return;
  const els = getImageRowElements(row);
  if (!els) return;
  initializedImageRows.add(row);
  els.srcEl.addEventListener('input', () => {
    syncImageRow(row);
  });
  els.srcEl.addEventListener('change', () => {
    syncImageRow(row);
    fillImageRowDimensions(row);
  });
  els.removeBtn.addEventListener('click', () => {
    removeImageRow(row);
  });
  syncImageRow(row);
};

const initImageRows = () => {
  getImageRows().forEach((row) => initImageRow(row));
};

const addImageRow = () => {
  if (!imagesWrap || !imageTemplate) return;
  const templateRow = imageTemplate.content.firstElementChild as HTMLElement | null;
  if (!templateRow) return;
  const row = templateRow.cloneNode(true) as HTMLElement;
  imagesWrap.appendChild(row);
  initImageRow(row);
  syncImageRows();
  row.querySelector<HTMLInputElement>('[data-bits-image-src]')?.focus();
};

const tryClipboardCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const collectImages = () => {
  const rows = getImageRows();
  const images: Array<{ src: string; width: number; height: number }> = [];
  for (const row of rows) {
    const els = getImageRowElements(row);
    if (!els) continue;
    const srcValue = normalizeImage(els.srcEl.value ?? '');
    if (!srcValue) continue;
    const widthValue = els.widthEl.value.trim();
    const heightValue = els.heightEl.value.trim();
    if (!widthValue || !heightValue) {
      setStatus('图片已填写，请补全宽高。', 'error');
      if (!widthValue) els.widthEl.focus();
      else els.heightEl.focus();
      return null;
    }
    const widthNumber = Number(widthValue);
    const heightNumber = Number(heightValue);
    if (!Number.isFinite(widthNumber) || widthNumber <= 0) {
      setStatus('图片宽度需为正数。', 'error');
      els.widthEl.focus();
      return null;
    }
    if (!Number.isFinite(heightNumber) || heightNumber <= 0) {
      setStatus('图片高度需为正数。', 'error');
      els.heightEl.focus();
      return null;
    }
    images.push({ src: srcValue, width: widthNumber, height: heightNumber });
  }
  return images;
};

const buildMarkdown = () => {
  if (!contentEl) return null;
  const content = contentEl.value.trim();
  if (!content) {
    setStatus('请先填写内容。', 'error');
    contentEl.focus();
    return null;
  }

  const images = collectImages();
  if (!images) return null;

  let tags = parseTags(tagsEl?.value ?? '');
  const rawPlace = (placeEl?.value ?? '').trim();
  const placeValue = rawPlace.replace(/^loc:/i, '').trim();
  if (placeValue) {
    tags = tags.filter((tag) => !tag.trim().toLowerCase().startsWith('loc:'));
    tags.unshift(`loc:${placeValue}`);
  }
  const authorNameValue = normalizeAuthorName(authorNameEl?.value ?? '');
  const authorAvatarValue = normalizeAuthorAvatar(authorAvatarEl?.value ?? '');
  const authorNameOverride = authorNameValue && authorNameValue !== defaultAuthorName ? authorNameValue : '';
  const authorAvatarOverride = authorAvatarValue && authorAvatarValue !== defaultAuthorAvatar ? authorAvatarValue : '';
  const shouldWriteAuthor = !!authorNameOverride || !!authorAvatarOverride;
  const lines: string[] = ['---', `date: ${formatDateLocal()}`];

  if (tags.length) {
    lines.push('tags:');
    tags.forEach((tag) => {
      lines.push(`  - ${formatTag(tag)}`);
    });
  }

  if (shouldWriteAuthor) {
    lines.push('author:');
    if (authorNameOverride) lines.push(`  name: ${formatTag(authorNameOverride)}`);
    if (authorAvatarOverride) lines.push(`  avatar: ${formatTag(authorAvatarOverride)}`);
  }

  if (draftEl?.checked) {
    lines.push('draft: true');
  }

  if (images.length) {
    lines.push('images:');
    images.forEach((image) => {
      lines.push(`  - src: ${image.src}`);
      lines.push(`    width: ${image.width}`);
      lines.push(`    height: ${image.height}`);
    });
  }

  lines.push('---', '', content);
  return lines.join('\n');
};

const openDialog = () => {
  if (!dialog) return;
  if (dialog.open) return;
  clearStatus();
  hideManualCopy();
  updateManualLink();
  syncImageRows();
  updateToolbarActive();
  setAuthorPlaceholders();
  updateIdentityPill();
  updateIdentityToggleState();
  dialog.showModal();
  window.setTimeout(() => {
    contentEl?.focus();
  }, 0);
};

const closeDialog = () => {
  if (!dialog) return;
  hideManualCopy();
  hasGenerated = false;
  lastMarkdown = '';
  updateManualLink();
  if (authorNameEl) authorNameEl.value = '';
  if (authorAvatarEl) authorAvatarEl.value = '';
  if (identityDetails) identityDetails.open = false;
  updateIdentityPill();
  updateIdentityToggleState();
  dialog.close();
};

if (openBtn && dialog) {
  openBtn.addEventListener('click', (event) => {
    event.preventDefault();
    openDialog();
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      closeDialog();
    });
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  dialog.addEventListener('cancel', () => {
    closeDialog();
  });
}

initImageRows();
imageAddBtn?.addEventListener('click', () => {
  addImageRow();
});

identityPill?.addEventListener('click', () => {
  toggleIdentityDetails();
});

identityNew?.addEventListener('click', () => {
  toggleIdentityDetails();
});

authorNameEl?.addEventListener('input', () => {
  updateIdentityPill();
});

authorAvatarEl?.addEventListener('input', () => {
  updateIdentityPill();
});

authorResetBtn?.addEventListener('click', () => {
  if (authorNameEl) authorNameEl.value = '';
  if (authorAvatarEl) authorAvatarEl.value = '';
  updateIdentityPill();
});

form?.addEventListener('input', () => {
  if (statusEl?.textContent) clearStatus();
  if (manualBox && !manualBox.hidden) hideManualCopy();
  updateManualLink();
});

contentEl?.addEventListener('input', () => {
  updateToolbarActive();
  updateManualLink();
  if (!isApplyingToolbar) {
    lastEditSource = 'typing';
  }
});

contentEl?.addEventListener('mouseup', () => {
  updateToolbarActive();
});

contentEl?.addEventListener('keyup', () => {
  updateToolbarActive();
});

contentEl?.addEventListener('keydown', (event) => {
  const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z';
  if (!isUndo) return;
  if (lastEditSource !== 'toolbar' || toolbarUndoStack.length === 0) return;
  event.preventDefault();
  const snapshot = toolbarUndoStack.pop();
  if (!snapshot || !contentEl) return;
  isApplyingToolbar = true;
  contentEl.value = snapshot.value;
  contentEl.setSelectionRange(snapshot.start, snapshot.end);
  isApplyingToolbar = false;
  updateToolbarActive();
  updateManualLink();
  if (toolbarUndoStack.length === 0) {
    lastEditSource = 'typing';
  }
});

tagsEl?.addEventListener('compositionstart', () => {
  isComposingTags = true;
});
tagsEl?.addEventListener('compositionend', () => {
  isComposingTags = false;
  normalizeTagsField();
});
tagsEl?.addEventListener('input', () => {
  if (isComposingTags) return;
  normalizeTagsField();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
});

manualCopyBtn?.addEventListener('click', async () => {
  if (!manualTextarea) return;
  manualTextarea.focus();
  manualTextarea.select();
  const ok = await tryClipboardCopy(manualTextarea.value);
  if (manualNote) {
    manualNote.textContent = ok ? '已复制草稿。' : '已为你选中文本，按 ⌘C / Ctrl+C 复制。';
  }
});

manualOpenBtn?.addEventListener('click', () => {
  clearStatus();
  if (manualBox && !manualBox.hidden) {
    hideManualCopy();
    return;
  }
  const contentValue = contentEl?.value.trim() ?? '';
  let markdown = '';
  if (contentValue) {
    const built = buildMarkdown();
    if (!built) return;
    markdown = built;
    rememberMarkdown(markdown);
  } else if (hasGenerated && lastMarkdown) {
    markdown = lastMarkdown;
  } else {
    setStatus('请先填写内容。', 'error');
    contentEl?.focus();
    return;
  }
  showManualCopy(markdown, '已生成草稿。');
});

toolbar?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>('button[data-action]');
  if (!button) return;
  const action = button.getAttribute('data-action');
  if (!action) return;
  applyToolbarAction(() => {
    switch (action) {
      case 'bold':
        wrapSelection('**', '**', 'text');
        break;
      case 'italic':
        wrapSelection('*', '*', 'text');
        break;
      case 'code':
        wrapSelection('`', '`', 'code');
        break;
      case 'quote':
        prefixLines('> ');
        break;
      case 'list':
        prefixLines('- ');
        break;
      case 'link':
        wrapSelection('[', '](url)', 'text');
        break;
      case 'paragraph':
        insertText('\n');
        break;
      default:
        break;
    }
  });
});

generateBtn?.addEventListener('click', async () => {
  clearStatus();
  hideManualCopy();
  const markdown = buildMarkdown();
  if (!markdown) return;
  rememberMarkdown(markdown);
  if (!window.isSecureContext || !navigator.clipboard?.writeText) {
    showManualCopy(
      markdown,
      '已生成草稿。'
    );
    return;
  }
  const ok = await tryClipboardCopy(markdown);
  if (ok) setStatus('已复制草稿。', 'success');
  else {
    showManualCopy(
      markdown,
      '已生成草稿。'
    );
  }
});

downloadBtn?.addEventListener('click', () => {
  clearStatus();
  hideManualCopy();
  const markdown = buildMarkdown();
  if (!markdown) return;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bits-${formatFileStamp()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setStatus('已下载草稿。', 'success');
});
