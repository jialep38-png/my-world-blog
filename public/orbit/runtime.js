export {};

const WORLDS = Object.freeze({
  'yesterday-today': { title: '昨天，今天', edition: '0.12.3' },
  crossover: { title: '删了一百遍', edition: '0.12.3' },
  poem: { title: '思念若是一首诗', edition: '0.22.0' },
  'rain-finale': { title: '雨终曲', edition: '0.12.3' },
  jielan: { title: '芥兰', edition: '0.24.0' },
});

const params = new URLSearchParams(location.search);
const world = params.get('world') || 'jielan';
const requestedTheme = params.get('theme');
const initialTheme = requestedTheme === 'dark' ? 'dark' : 'light';
const shell = document.querySelector('#viewer');
const canvas = document.querySelector('#canvas');
const labels = document.querySelector('#labels');
const title = document.querySelector('#viewer-title');
const stageStatus = document.querySelector('#status');
const errorPanel = document.querySelector('#error');
const buttons = [...document.querySelectorAll('#controls button')];
const turnButton = document.querySelector('[data-action="turn"]');
const pauseButton = document.querySelector('[data-action="pause"]');

let viewer = null;
let readyPending = false;
let readySent = false;
let errorSent = false;
let disposed = false;
let userPaused = false;
let outsideViewport = false;
let parentVisible = true;
let autoTurning = false;

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
}

function postToParent(message) {
  if (window.parent === window || location.origin === 'null') return;
  window.parent.postMessage(message, location.origin);
}

function announceReady() {
  if (readySent || disposed) return;
  if (!viewer) {
    readyPending = true;
    return;
  }
  readyPending = false;
  readySent = true;
  shell.classList.add('is-ready');
  shell.setAttribute('aria-busy', 'false');
  buttons.forEach((button) => { button.disabled = false; });
  if (!viewer?.setTurn) turnButton.hidden = true;
  stageStatus.textContent = '三维已就绪 · 拖动旋转 · 滚轮或双指缩放';
  postToParent({ type: 'orbit:ready', world });
}

function fail() {
  if (disposed || errorSent) return;
  errorSent = true;
  shell.setAttribute('aria-busy', 'false');
  buttons.forEach((button) => { button.disabled = true; });
  errorPanel.hidden = false;
  postToParent({ type: 'orbit:error', world });
}

function setSuspended() {
  if (!viewer || disposed) return;
  const value = userPaused || outsideViewport || !parentVisible || document.hidden;
  if (typeof viewer.suspend === 'function') viewer.suspend(value);
  else if (typeof viewer.setPaused === 'function') viewer.setPaused(value);
}

function resetViewer() {
  if (!viewer) return;
  autoTurning = false;
  turnButton.setAttribute('aria-pressed', 'false');
  viewer.setTurn?.(false);
  if (typeof viewer.reset === 'function') viewer.reset();
  else viewer.setView?.('front');
}

async function fetchJson(relative) {
  const response = await fetch(relative, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Runtime asset returned HTTP ${response.status}`);
  return response.json();
}

async function loadWorld() {
  const onReady = () => queueMicrotask(announceReady);
  const onError = () => fail();
  switch (world) {
    case 'yesterday-today': {
      const { createYesterdayViewer } = await import('./source/src/yesterday-today/viewer.js');
      return createYesterdayViewer(canvas, { onReady, onError });
    }
    case 'crossover': {
      const [{ createCrossoverViewer }, data] = await Promise.all([
        import('./source/src/crossover/viewer.js'),
        fetchJson('./source/assets/crossover/title-glyphs.json'),
      ]);
      return createCrossoverViewer(canvas, { glyphs: data.glyphs || {}, onReady, onError });
    }
    case 'rain-finale': {
      const [{ createRainViewer }, data] = await Promise.all([
        import('./source/src/rain-finale/viewer.js'),
        fetchJson('./source/assets/rain-finale/title-glyphs.json'),
      ]);
      return createRainViewer(canvas, { glyphs: data.glyphs || {}, onReady, onError });
    }
    case 'jielan': {
      const { createJielanViewer } = await import('./source/src/jielan/viewer.js');
      return createJielanViewer(canvas, { onReady, onError });
    }
    case 'poem': {
      const { createWorld } = await import('./source/src/world.js');
      const instance = createWorld({
        canvas,
        labelLayer: labels,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        orbitOnly: true,
        onError,
      });
      await instance.ready;
      queueMicrotask(onReady);
      return instance;
    }
    default:
      throw new Error('Unknown world');
  }
}

function dispose() {
  if (disposed) return;
  disposed = true;
  viewer?.dispose?.();
  viewer = null;
}

applyTheme(initialTheme);
if (WORLDS[world]) {
  title.textContent = `${WORLDS[world].title} · 三维小星球`;
  document.title = `${WORLDS[world].title} · 三维查看`;
  canvas.dataset.world = world;
  canvas.dataset.edition = WORLDS[world].edition;
} else {
  fail();
}

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.origin !== location.origin) return;
  if (event.data?.type === 'orbit:theme') {
    if (event.data.theme === 'light' || event.data.theme === 'dark') applyTheme(event.data.theme);
    return;
  }
  if (event.data?.type === 'orbit:visibility' && typeof event.data.visible === 'boolean') {
    parentVisible = event.data.visible;
    setSuspended();
  }
});

for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => {
    autoTurning = false;
    turnButton.setAttribute('aria-pressed', 'false');
    viewer?.setTurn?.(false);
    viewer?.setView?.(button.dataset.view);
    canvas.focus({ preventScroll: true });
  });
}

document.querySelector('[data-action="reset"]').addEventListener('click', () => {
  resetViewer();
  canvas.focus({ preventScroll: true });
});

turnButton.addEventListener('click', () => {
  autoTurning = !autoTurning;
  turnButton.setAttribute('aria-pressed', String(autoTurning));
  viewer?.setTurn?.(autoTurning);
});

pauseButton.addEventListener('click', () => {
  userPaused = !userPaused;
  pauseButton.setAttribute('aria-pressed', String(userPaused));
  pauseButton.textContent = userPaused ? '继续' : '暂停';
  setSuspended();
});

const viewportObserver = new IntersectionObserver(([entry]) => {
  outsideViewport = !entry.isIntersecting;
  setSuspended();
}, { threshold: 0.01 });
viewportObserver.observe(shell);
document.addEventListener('visibilitychange', setSuspended);
window.addEventListener('pagehide', dispose, { once: true });
window.addEventListener('beforeunload', dispose, { once: true });

if (WORLDS[world]) {
  const pendingViewer = loadWorld();
  let hardTimedOut = false;
  const slowNoticeId = setTimeout(() => {
    stageStatus.textContent = '三维场景仍在准备，请稍候…';
  }, 12000);
  let hardTimeoutId;
  const timeout = new Promise((_, reject) => {
    hardTimeoutId = setTimeout(() => {
      hardTimedOut = true;
      reject(new Error('Viewer load timed out'));
    }, 45000);
  });
  try {
    viewer = await Promise.race([pendingViewer, timeout]);
    clearTimeout(slowNoticeId);
    clearTimeout(hardTimeoutId);
    setSuspended();
    if (readyPending || world === 'poem') announceReady();
  } catch (error) {
    clearTimeout(slowNoticeId);
    clearTimeout(hardTimeoutId);
    if (hardTimedOut) pendingViewer.then((lateViewer) => lateViewer?.dispose?.()).catch(() => {});
    console.error('Orbit viewer failed to load.', error);
    fail();
  }
}
