export {};
const stage = document.querySelector<HTMLElement>('[data-planet-stage]');

if (stage) {
  const frameHost = stage.querySelector<HTMLElement>('[data-frame]')!;
  const still = stage.querySelector<HTMLButtonElement>('[data-still]')!;
  const live = stage.querySelector<HTMLButtonElement>('[data-live]')!;
  const status = stage.querySelector<HTMLElement>('[data-stage-status]')!;
  const actions = stage.querySelector<HTMLElement>('[data-stage-actions]')!;
  let frame: HTMLIFrameElement | null = null;
  let slowNotice: ReturnType<typeof setTimeout> | undefined;
  let inView = true;
  const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const sendVisibility = () => frame?.contentWindow?.postMessage({ type: 'orbit:visibility', visible: inView && !document.hidden && !document.querySelector('dialog[open]') }, location.origin);

  function showPhotograph(message = '静静看一会儿，也可以转到另一面。') {
    clearTimeout(slowNotice);
    frame?.remove();
    frame = null;
    delete stage!.dataset.mode;
    stage!.setAttribute('aria-busy', 'false');
    still.setAttribute('aria-pressed', 'true');
    live.setAttribute('aria-pressed', 'false');
    live.setAttribute('aria-disabled', 'false');
    status.textContent = message;
  }

  still.addEventListener('click', () => showPhotograph());
  live.addEventListener('click', () => {
    if (frame) return;
    const url = new URL(stage.dataset.viewer!, location.origin);
    url.searchParams.set('world', stage.dataset.world!);
    url.searchParams.set('theme', theme());
    frame = document.createElement('iframe');
    frame.src = url.href;
    frame.title = `${stage.dataset.title} · 三维星球查看器`;
    frame.setAttribute('allow', 'fullscreen');
    frame.addEventListener('error', () => showPhotograph('三维暂未展开，图版仍可欣赏。可以再试一次。'), { once: true });
    frameHost.append(frame);
    stage.dataset.mode = 'loading';
    stage.setAttribute('aria-busy', 'true');
    live.setAttribute('aria-disabled', 'true');
    status.textContent = '正在展开这颗小星球…';
    slowNotice = setTimeout(() => {
      if (stage.dataset.mode === 'loading') status.textContent = '材料还在慢慢加载；也可以点「图版」先看静态作品。';
    }, 15000);
  });

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame?.contentWindow || !event.data || event.data.world !== stage.dataset.world) return;
    if (event.data.type === 'orbit:ready') {
      clearTimeout(slowNotice);
      stage.dataset.mode = 'live';
      stage.setAttribute('aria-busy', 'false');
      live.setAttribute('aria-disabled', 'false');
      live.setAttribute('aria-pressed', 'true');
      still.setAttribute('aria-pressed', 'false');
      status.textContent = '拖动旋转，滚轮或双指缩放。看完后可以回到图版。';
      sendVisibility();
    } else if (event.data.type === 'orbit:error') {
      showPhotograph('三维暂未展开，图版仍可欣赏。可以再试一次。');
    } else if (event.data.type === 'orbit:close') {
      showPhotograph();
      live.focus();
    }
  });

  new MutationObserver(() => {
    frame?.contentWindow?.postMessage({ type: 'orbit:theme', theme: theme() }, location.origin);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting);
    sendVisibility();
  }).observe(stage);
  document.addEventListener('visibilitychange', sendVisibility);
  const lightbox = document.querySelector('#lightbox');
  if (lightbox) new MutationObserver(sendVisibility).observe(lightbox, { attributes: true, attributeFilter: ['open'] });
  window.addEventListener('pagehide', () => showPhotograph());
  actions.hidden = false;
}
