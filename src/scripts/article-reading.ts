const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {
      // Some browsers expose Clipboard but deny it at runtime. Use the local fallback.
    }
  }

  const helper = document.createElement('textarea');
  helper.value = value;
  helper.readOnly = true;
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  helper.style.pointerEvents = 'none';
  document.body.appendChild(helper);
  helper.select();

  let copied = false;
  try {
    const legacyDocument = document as unknown as {
      execCommand?: (commandId: string) => boolean;
    };
    copied = legacyDocument.execCommand?.('copy') ?? false;
  } catch (_) {
    copied = false;
  }
  helper.remove();
  return copied;
};

export const initArticleReading = () => {
  const article = document.querySelector<HTMLElement>('[data-article-body]');
  if (!article || article.dataset.readingReady === 'true') return;
  article.dataset.readingReady = 'true';

  const progress = document.querySelector<HTMLElement>('[data-article-progress]');
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  const headings = Array.from(new Set(
    tocLinks
      .map((link) => link.dataset.tocTarget)
      .filter((slug): slug is string => Boolean(slug))
  ))
    .map((slug) => document.getElementById(slug))
    .filter((heading): heading is HTMLElement => heading instanceof HTMLElement);

  let frame = 0;
  let lastPercent = -1;
  let lastSlug = '';

  const updateProgress = () => {
    if (!progress) return;

    const pageY = window.scrollY || document.documentElement.scrollTop || 0;
    const articleTop = article.getBoundingClientRect().top + pageY;
    const articleBottom = articleTop + article.offsetHeight;
    const finish = Math.max(articleTop + 1, articleBottom - window.innerHeight);
    const percent = Math.round(clamp((pageY - articleTop) / (finish - articleTop), 0, 1) * 100);

    if (percent === lastPercent) return;
    lastPercent = percent;
    progress.style.setProperty('--article-progress', String(percent / 100));
    progress.setAttribute('aria-valuenow', String(percent));
  };

  const updateToc = () => {
    if (!headings.length) return;

    const marker = Math.min(180, Math.max(88, window.innerHeight * 0.18));
    const firstHeading = headings[0];
    if (!firstHeading) return;
    let current = firstHeading;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= marker) current = heading;
      else break;
    }

    const nearArticleEnd = window.scrollY + window.innerHeight >=
      article.getBoundingClientRect().top + window.scrollY + article.offsetHeight - 8;
    if (nearArticleEnd) current = headings.at(-1) ?? current;
    if (current.id === lastSlug) return;

    lastSlug = current.id;
    tocLinks.forEach((link) => {
      if (link.dataset.tocTarget === lastSlug) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const update = () => {
    frame = 0;
    updateProgress();
    updateToc();
  };

  const scheduleUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(article);
  }

  document.querySelectorAll<HTMLAnchorElement>('.article-toc-mobile [data-toc-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const details = link.closest('details');
      if (details instanceof HTMLDetailsElement) details.open = false;
    });
  });

  const shareButton = document.querySelector<HTMLButtonElement>('[data-copy-article-link]');
  const shareLabel = shareButton?.querySelector<HTMLElement>('[data-copy-article-label]') ?? null;
  const shareStatus = document.querySelector<HTMLElement>('[data-copy-article-status]');
  let shareReset = 0;

  shareButton?.addEventListener('click', async () => {
    window.clearTimeout(shareReset);
    const pageUrl = new URL(window.location.href);
    pageUrl.hash = '';
    const copied = await copyText(pageUrl.toString());
    const message = copied ? '已复制' : '复制失败';

    shareButton.dataset.state = copied ? 'copied' : 'failed';
    if (shareLabel) shareLabel.textContent = message;
    if (shareStatus) shareStatus.textContent = copied ? '文章链接已复制' : '文章链接复制失败';

    shareReset = window.setTimeout(() => {
      shareButton.dataset.state = 'idle';
      if (shareLabel) shareLabel.textContent = '复制链接';
      if (shareStatus) shareStatus.textContent = '';
    }, 2200);
  });

  update();
};
