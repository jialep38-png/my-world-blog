export {};
const section = document.querySelector<HTMLElement>('[data-home-latest]');
if (section) {
  const filters = section.querySelector<HTMLElement>('.home-filters')!;
  const buttons = [...filters.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const entries = [...section.querySelectorAll<HTMLElement>('[data-entry-kind]')];
  const indicator = filters.querySelector<HTMLElement>('.home-filters__indicator')!;
  const status = section.querySelector<HTMLElement>('[data-filter-status]')!;
  let selected = buttons[0];
  const positionIndicator = () => {
    if (!selected) return;
    indicator.style.width = `${selected.offsetWidth}px`;
    indicator.style.transform = `translateX(${selected.offsetLeft}px)`;
  };
  filters.hidden = false;
  for (const button of buttons) button.addEventListener('click', () => {
    selected = button;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    let shown = 0;
    for (const entry of entries) {
      entry.hidden = button.dataset.filter !== 'all' && entry.dataset.entryKind !== button.dataset.filter;
      if (!entry.hidden) shown++;
    }
    positionIndicator();
    status.textContent = `显示 ${shown} 篇${button.dataset.filter === 'all' ? '最近更新' : button.textContent}`;
  });
  new ResizeObserver(positionIndicator).observe(filters);
  positionIndicator();
}
