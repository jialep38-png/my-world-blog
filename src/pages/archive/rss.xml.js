import rss from '@astrojs/rss';
import { getPublished, isReservedSlug } from '../../lib/content';
import { createWithBase } from '../../utils/format';
import { site } from '../../../site.config.mjs';

const base = import.meta.env.BASE_URL ?? '/';
const withBase = createWithBase(base);

export async function GET(context) {
  const essays = await getPublished('essay', {
    includeDraft: false,
    orderBy: (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  });
  const archiveItems = essays
    .filter((entry) => entry.data.archive !== false)
    .filter((entry) => !isReservedSlug(entry.data.slug ?? entry.id))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: `${site.title} · 归档`,
    description: '归档更新',
    site: context.site,
    items: archiveItems.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description,
      link: withBase(`/archive/${entry.data.slug ?? entry.id}/`)
    }))
  });
}
