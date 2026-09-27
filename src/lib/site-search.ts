export const SITE_SEARCH_GROUPS = ['快捷前往', '随笔', '笔记', '项目', '小星球'] as const;

export type SiteSearchGroup = (typeof SITE_SEARCH_GROUPS)[number];

export type SiteSearchItem = {
  id: string;
  group: SiteSearchGroup;
  title: string;
  description: string;
  tags: string[];
  href: string;
  date?: string;
  text?: string;
};

export type RankedSiteSearchItem = SiteSearchItem & { score: number };

const normalize = (value: string) =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/\s+/g, ' ')
    .trim();

export function rankSiteSearchItem(item: SiteSearchItem, query: string): number | null {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return item.group === '快捷前往' ? 1 : null;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  const title = normalize(item.title);
  const description = normalize(item.description);
  const tags = item.tags.map(normalize);
  const body = normalize(item.text ?? '');
  const allText = `${title} ${description} ${tags.join(' ')} ${body}`;

  if (!tokens.every((token) => allText.includes(token))) return null;

  let score = 0;
  for (const token of tokens) {
    if (title === token) score += 120;
    else if (title.startsWith(token)) score += 90;
    else if (title.includes(token)) score += 70;

    for (const tag of tags) {
      if (tag === token) score += 65;
      else if (tag.startsWith(token)) score += 48;
      else if (tag.includes(token)) score += 36;
    }

    if (description.includes(token)) score += 24;
    if (body.includes(token)) score += 10;
  }

  return score;
}

export function searchSiteIndex(items: SiteSearchItem[], query: string): RankedSiteSearchItem[] {
  return items
    .map((item) => {
      const score = rankSiteSearchItem(item, query);
      return score === null ? null : { ...item, score };
    })
    .filter((item): item is RankedSiteSearchItem => item !== null)
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const groupDiff = SITE_SEARCH_GROUPS.indexOf(a.group) - SITE_SEARCH_GROUPS.indexOf(b.group);
      if (groupDiff !== 0) return groupDiff;
      return (b.date ?? '').localeCompare(a.date ?? '');
    });
}

export function isSiteSearchItem(value: unknown): value is SiteSearchItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<SiteSearchItem>;
  return (
    typeof item.id === 'string' &&
    SITE_SEARCH_GROUPS.includes(item.group as SiteSearchGroup) &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    Array.isArray(item.tags) &&
    item.tags.every((tag) => typeof tag === 'string') &&
    typeof item.href === 'string' &&
    (item.date === undefined || typeof item.date === 'string') &&
    (item.text === undefined || typeof item.text === 'string')
  );
}
