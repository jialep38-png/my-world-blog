import { createWithBase } from '../utils/format';

type IndexItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  text: string;
  date: string | null;
};

const searchRoot = document.querySelector<HTMLElement>('[data-entry-search]');
if (!searchRoot) {
  // Current page does not use entry search.
} else {
  const input = searchRoot.querySelector<HTMLInputElement>('[data-entry-search-input]');
  const toggleBtn = searchRoot.querySelector<HTMLButtonElement>('[data-entry-search-toggle]');
  const panel = searchRoot.querySelector<HTMLElement>('[data-entry-search-panel]');
  const statusEl = document.querySelector<HTMLDivElement>('[data-entry-search-status]');
  const indexUrlRaw = (searchRoot.dataset.indexUrl ?? '').trim();
  const sectionSelector = (searchRoot.dataset.sectionSelector ?? '').trim();

  const base = import.meta.env.BASE_URL ?? '/';
  const withBase = createWithBase(base);
  const indexUrl = indexUrlRaw ? withBase(indexUrlRaw) : '';

  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-entry-item]')).map((el) => ({
    el,
    slug: (el.getAttribute('data-slug') || '').trim()
  }));

  const sections = sectionSelector
    ? Array.from(document.querySelectorAll<HTMLElement>(sectionSelector))
    : [];

  const setStatus = (text: string) => {
    if (!statusEl) return;
    if (statusEl.textContent === text) return;
    statusEl.textContent = text;
  };

  const showAll = () => {
    for (const { el } of items) {
      el.style.display = '';
    }
  };

  const syncSections = (hasQuery: boolean) => {
    if (!sections.length) return;
    for (const section of sections) {
      const sectionItems = Array.from(section.querySelectorAll<HTMLElement>('[data-entry-item]'));
      const hasVisible = sectionItems.some((el) => el.style.display !== 'none');
      section.hidden = hasQuery && !hasVisible;
    }
  };

  const buildHay = (item: IndexItem) => {
    const tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
    return `${item.title ?? ''} ${item.description ?? ''} ${tags} ${item.text ?? ''}`.toLowerCase();
  };

  let indexPromise: Promise<IndexItem[] | null> | null = null;
  let indexCache: IndexItem[] | null = null;
  let indexHay: Map<string, string> | null = null;
  let indexFailed = false;

  const isOpen = () => searchRoot.classList.contains('is-open');

  const setOpen = (open: boolean) => {
    if (open) {
      searchRoot.classList.add('is-open');
    } else {
      searchRoot.classList.remove('is-open');
    }
    toggleBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel?.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (input) input.tabIndex = open ? 0 : -1;
  };

  const setDegradedMode = () => {
    if (input) {
      input.placeholder = '索引加载失败';
      input.disabled = true;
      input.setAttribute('aria-disabled', 'true');
    }
    if (toggleBtn) {
      toggleBtn.disabled = true;
      toggleBtn.setAttribute('aria-disabled', 'true');
    }
    setStatus('索引加载失败，已禁用搜索');
    showAll();
    syncSections(false);
  };

  const loadIndex = async () => {
    if (!indexUrl) return null;
    if (indexCache) return indexCache;
    if (indexFailed) return null;
    if (!indexPromise) {
      setStatus('正在加载索引...');
      indexPromise = fetch(indexUrl)
        .then((r) => {
          if (!r.ok) throw new Error('index fetch failed');
          return r.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) throw new Error('index data invalid');
          indexCache = data as IndexItem[];
          indexHay = new Map(indexCache.map((item) => [item.slug, buildHay(item)]));
          setStatus('');
          return indexCache;
        })
        .catch(() => {
          indexFailed = true;
          setDegradedMode();
          return null;
        });
    }
    return indexPromise;
  };

  const applyFilter = async () => {
    if (!input) return;
    const q = (input.value || '').trim().toLowerCase();
    if (!q) {
      showAll();
      syncSections(false);
      setStatus('');
      return;
    }

    const index = await loadIndex();
    if (!index || !indexHay) {
      showAll();
      syncSections(false);
      return;
    }

    const matchedSlugs = new Set<string>();
    for (const item of index) {
      const hay = indexHay.get(item.slug) || '';
      if (hay.includes(q)) matchedSlugs.add(item.slug);
    }

    let visibleMatches = 0;
    for (const { el, slug } of items) {
      const matched = slug ? matchedSlugs.has(slug) : false;
      el.style.display = matched ? '' : 'none';
      if (matched) visibleMatches += 1;
    }

    syncSections(true);

    const totalMatches = matchedSlugs.size;
    if (totalMatches === 0) {
      setStatus('未找到匹配内容');
      return;
    }
    if (visibleMatches === totalMatches) {
      setStatus(`命中 ${totalMatches} 条`);
      return;
    }
    if (visibleMatches === 0) {
      setStatus(`共命中 ${totalMatches} 条（当前页无结果，可翻页继续查看）`);
      return;
    }
    setStatus(`共命中 ${totalMatches} 条（当前页 ${visibleMatches} 条，可翻页查看更多）`);
  };

  const resetFilter = () => {
    if (input) input.value = '';
    showAll();
    syncSections(false);
    setStatus('');
  };

  const closeSearch = () => {
    setOpen(false);
  };

  setOpen(false);

  toggleBtn?.addEventListener('click', () => {
    const next = !isOpen();
    if (next) {
      setOpen(true);
      window.setTimeout(() => input?.focus(), 0);
      void loadIndex();
      return;
    }
    resetFilter();
    closeSearch();
  });

  input?.addEventListener('focus', () => {
    setOpen(true);
    void loadIndex();
  });
  input?.addEventListener('input', () => {
    void applyFilter();
  });
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      resetFilter();
      closeSearch();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      void applyFilter();
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Node | null;
    if (!target) return;
    if (!isOpen()) return;
    if (searchRoot.contains(target)) return;
    if (input?.value.trim()) return;
    closeSearch();
  });
}
