import {
  SITE_SEARCH_GROUPS,
  isSiteSearchItem,
  searchSiteIndex,
  type SiteSearchItem
} from '../lib/site-search';

const dialog = document.querySelector<HTMLDialogElement>('[data-site-search-dialog]');

if (dialog) {
  const input = dialog.querySelector<HTMLInputElement>('[data-search-input]');
  const results = dialog.querySelector<HTMLElement>('[data-search-results]');
  const status = dialog.querySelector<HTMLElement>('[data-search-status]');
  const closeButton = dialog.querySelector<HTMLButtonElement>('[data-search-close]');
  const indexUrl = (dialog.dataset.indexUrl ?? '').trim();
  const base = import.meta.env.BASE_URL ?? '/';

  let index: SiteSearchItem[] | null = null;
  let indexRequest: Promise<SiteSearchItem[]> | null = null;
  let returnFocus: HTMLElement | null = null;
  let resultLinks: HTMLAnchorElement[] = [];

  document.querySelectorAll<HTMLElement>('[data-search-open][hidden]').forEach((trigger) => {
    trigger.hidden = false;
  });

  const setStatus = (message: string, busy = false) => {
    if (status) status.textContent = message;
    dialog.setAttribute('aria-busy', String(busy));
  };

  const clearResults = () => {
    results?.replaceChildren();
    resultLinks = [];
  };

  const safeHref = (href: string) => {
    try {
      const url = new URL(href, window.location.href);
      const basePath = base.endsWith('/') ? base : `${base}/`;
      if (url.origin !== window.location.origin || !url.pathname.startsWith(basePath)) return null;
      return url.href;
    } catch {
      return null;
    }
  };

  const makeResultLink = (item: SiteSearchItem) => {
    const href = safeHref(item.href);
    if (!href) return null;

    const link = document.createElement('a');
    link.className = 'site-search__result';
    link.href = href;
    link.dataset.searchResult = '';

    const copy = document.createElement('span');
    copy.className = 'site-search__result-copy';

    const title = document.createElement('strong');
    title.textContent = item.title;
    copy.append(title);

    if (item.description) {
      const description = document.createElement('small');
      description.textContent = item.description;
      copy.append(description);
    }

    const meta = document.createElement('span');
    meta.className = 'site-search__result-meta';
    meta.textContent = [item.date, item.tags.slice(0, 2).map((tag) => `#${tag}`).join(' ')]
      .filter(Boolean)
      .join(' · ');

    const arrow = document.createElement('span');
    arrow.className = 'site-search__result-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';

    link.append(copy);
    if (meta.textContent) link.append(meta);
    link.append(arrow);
    return link;
  };

  const renderResults = () => {
    if (!index || !results) return;
    const query = input?.value.trim() ?? '';
    const matches = searchSiteIndex(index, query).slice(0, query ? 32 : 12);
    const fragment = document.createDocumentFragment();

    for (const group of SITE_SEARCH_GROUPS) {
      const items = matches.filter((item) => item.group === group);
      if (!items.length) continue;

      const section = document.createElement('section');
      section.className = 'site-search__group';

      const heading = document.createElement('h3');
      heading.textContent = group;
      section.append(heading);

      const list = document.createElement('div');
      list.className = 'site-search__group-list';
      for (const item of items) {
        const link = makeResultLink(item);
        if (link) list.append(link);
      }
      section.append(list);
      fragment.append(section);
    }

    results.replaceChildren(fragment);
    resultLinks = Array.from(results.querySelectorAll<HTMLAnchorElement>('[data-search-result]'));

    if (!query) setStatus('常用入口');
    else if (resultLinks.length === 0) setStatus(`没有找到“${query}”`);
    else setStatus(`找到 ${resultLinks.length} 条结果`);
  };

  const renderError = () => {
    clearResults();
    setStatus('索引没有加载成功，请稍后重试。');
    if (!results) return;

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'site-search__retry';
    retry.textContent = '重新加载';
    retry.addEventListener('click', () => {
      indexRequest = null;
      void loadIndex(true);
    });
    results.append(retry);
  };

  const loadIndex = async (force = false) => {
    if (index && !force) {
      renderResults();
      return index;
    }
    if (indexRequest && !force) return indexRequest;

    setStatus('正在翻阅索引…', true);
    clearResults();
    indexRequest = fetch(indexUrl, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Search index responded with ${response.status}`);
        const value: unknown = await response.json();
        if (!Array.isArray(value) || !value.every(isSiteSearchItem)) {
          throw new Error('Search index shape is invalid');
        }
        index = value;
        renderResults();
        return value;
      })
      .catch((error: unknown) => {
        console.error('[site-search] Failed to load index', error);
        renderError();
        throw error;
      })
      .finally(() => {
        dialog.setAttribute('aria-busy', 'false');
        indexRequest = null;
      });

    try {
      return await indexRequest;
    } catch {
      return [];
    }
  };

  const openSearch = (trigger?: HTMLElement | null) => {
    if (!dialog.open) {
      returnFocus = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      dialog.showModal();
    }
    window.setTimeout(() => input?.focus(), 0);
    void loadIndex();
  };

  const closeSearch = () => {
    if (dialog.open) dialog.close();
  };

  const isEditable = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
  };

  const focusResult = (index: number) => {
    const link = resultLinks.at(index);
    link?.focus();
  };

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-search-open]') : null;
    if (!target) return;
    event.preventDefault();
    openSearch(target);
  });

  document.addEventListener('keydown', (event) => {
    const commandK = event.key.toLocaleLowerCase() === 'k' && (event.metaKey || event.ctrlKey);
    const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;
    if ((commandK || slash) && !isEditable(event.target)) {
      event.preventDefault();
      openSearch();
    }
  });

  input?.addEventListener('input', renderResults);
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && resultLinks.length) {
      event.preventDefault();
      focusResult(0);
    } else if (event.key === 'ArrowUp' && resultLinks.length) {
      event.preventDefault();
      focusResult(resultLinks.length - 1);
    } else if (event.key === 'Enter' && resultLinks[0]) {
      event.preventDefault();
      resultLinks[0].click();
    }
  });

  results?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const current = document.activeElement instanceof HTMLAnchorElement
      ? resultLinks.indexOf(document.activeElement)
      : -1;
    if (current < 0) return;
    event.preventDefault();
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    const next = (current + offset + resultLinks.length) % resultLinks.length;
    focusResult(next);
  });

  closeButton?.addEventListener('click', closeSearch);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeSearch();
  });
  dialog.addEventListener('close', () => {
    const target = returnFocus;
    returnFocus = null;
    if (target?.isConnected) window.setTimeout(() => target.focus(), 0);
  });
}
