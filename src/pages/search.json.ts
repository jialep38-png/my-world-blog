import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { planets } from '../data/planets';
import { isProjectReviewEssay, isReservedSlug } from '../lib/content';
import type { SiteSearchItem } from '../lib/site-search';
import { cleanMarkdownToText } from '../utils/excerpt';
import { createWithBase } from '../utils/format';

export const prerender = true;

const MAX_INDEX_TEXT = 320;

const compactText = (markdown: string) => cleanMarkdownToText(markdown).slice(0, MAX_INDEX_TEXT);

export const GET: APIRoute = async () => {
  const withBase = createWithBase(import.meta.env.BASE_URL ?? '/');
  const [essayEntries, projectEntries] = await Promise.all([
    getCollection('essay', ({ data }) => data.draft !== true),
    getCollection('projects', ({ data }) => data.draft !== true)
  ]);

  const shortcutData: Array<[string, string, string, string]> = [
    ['home', '首页', '回到小圈首页', '/'],
    ['essays', '随笔', '浏览随笔与感想', '/essay/'],
    ['projects', '项目', '查看做过与正在做的项目', '/projects/'],
    ['planets', '小星球', '浏览五件小星球作品', '/planets/'],
    ['notes', '笔记', '阅读项目复盘与实践记录', '/bits/'],
    ['memo', '小记', '翻阅生活里的文字碎片', '/memo/'],
    ['archive', '归档', '按时间查看全部文章', '/archive/'],
    ['about', '关于', '了解这个小圈', '/about/']
  ];
  const shortcuts: SiteSearchItem[] = shortcutData.map(([id, title, description, href]) => ({
    id: `shortcut:${id}`,
    group: '快捷前往',
    title,
    description,
    tags: [],
    href: withBase(href)
  }));

  const essays: SiteSearchItem[] = essayEntries
    .filter((entry) => !isReservedSlug(entry.data.slug ?? entry.id))
    .map((entry) => {
      const slug = entry.data.slug ?? entry.id;
      const isNote = isProjectReviewEssay(entry);
      return {
        id: `essay:${slug}`,
        group: isNote ? '笔记' : '随笔',
        title: entry.data.title,
        description: entry.data.description ?? '',
        tags: entry.data.tags ?? [],
        href: withBase(`/archive/${slug}/`),
        date: entry.data.date.toISOString().slice(0, 10),
        text: compactText(entry.body ?? '')
      };
    });

  const projects: SiteSearchItem[] = projectEntries.map((entry) => {
    const slug = entry.data.slug ?? entry.id;
    return {
      id: `project:${slug}`,
      group: '项目',
      title: entry.data.title,
      description: entry.data.description,
      tags: [...(entry.data.tags ?? []), ...(entry.data.stack ?? [])],
      href: withBase(`/projects/${slug}/`),
      date: entry.data.date.toISOString().slice(0, 10),
      text: compactText(entry.body ?? '')
    };
  });

  const planetItems: SiteSearchItem[] = planets.map((planet) => ({
    id: `planet:${planet.id}`,
    group: '小星球',
    title: planet.title,
    description: planet.thought,
    tags: [planet.english, ...planet.materials.split(' · ')],
    href: withBase(`/planets/${planet.id}/`),
    text: `${planet.description} ${planet.note}`
  }));

  const index = [...shortcuts, ...essays, ...projects, ...planetItems];

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
    }
  });
};
