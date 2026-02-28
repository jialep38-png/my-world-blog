export function formatISODate(d: Date): string {
  // yyyy-mm-dd
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatMonthDay(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

export function createWithBase(base: string) {
  const baseNormalized = base.endsWith('/') ? base : `${base}/`;
  return (path: string) => {
    if (!path || path === '/') return baseNormalized;
    if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path;
    const clean = path.startsWith('/') ? path.slice(1) : path;
    return `${baseNormalized}${clean}`;
  };
}

export function groupByYear<T>(items: T[], getDate: (item: T) => Date) {
  const map = new Map<number, T[]>();
  for (const it of items) {
    const y = getDate(it).getFullYear();
    const arr = map.get(y) ?? [];
    arr.push(it);
    map.set(y, arr);
  }

  // Return as array sorted by year desc.
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({
      year,
      list: list.sort((a, b) => getDate(b).valueOf() - getDate(a).valueOf())
    }));
}

export function formatDateTime(d: Date): string {
  const yyyyMmDd = formatISODate(d);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${yyyyMmDd} ${hh}:${mm}`;
}
