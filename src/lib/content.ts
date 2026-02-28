import {
  getCollection,
  type CollectionEntry,
  type CollectionKey
} from 'astro:content';
export { createWithBase } from '../utils/format';

type OrderBy<K extends CollectionKey> = (a: CollectionEntry<K>, b: CollectionEntry<K>) => number;

export type GetPublishedOptions<K extends CollectionKey> = {
  orderBy?: OrderBy<K>;
  includeDraft?: boolean;
};

export const isReservedSlug = (slug: string) => slug.startsWith('page/');

export const getTotalPages = (itemCount: number, pageSize: number) =>
  Math.ceil(itemCount / pageSize);

export const getPageSlice = <T>(items: T[], currentPage: number, pageSize: number) => {
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const buildPaginatedPaths = (totalPages: number) => {
  if (totalPages <= 1) return [];
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    params: { page: String(i + 2) }
  }));
};

export async function getPublished<K extends CollectionKey>(
  name: K,
  opts: GetPublishedOptions<K> = {}
) {
  const prod = import.meta.env.PROD;
  const includeDraft = opts.includeDraft ?? !prod;
  const filter = includeDraft ? undefined : ({ data }: CollectionEntry<K>) => data.draft !== true;
  const items = await getCollection(name, filter);

  if (!opts.orderBy) return items;
  return items.slice().sort(opts.orderBy);
}

export type EssayEntry = CollectionEntry<'essay'>;

export const getEssaySlug = (entry: EssayEntry) => entry.data.slug ?? entry.id;

const orderByEssayDate = (a: EssayEntry, b: EssayEntry) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getSortedEssays() {
  return getPublished('essay', {
    orderBy: orderByEssayDate
  });
}

export async function getVisibleEssays() {
  const essays = await getSortedEssays();
  return essays.filter((entry) => !isReservedSlug(getEssaySlug(entry)));
}

export async function getArchiveEssays() {
  const essays = await getSortedEssays();
  return essays.filter((entry) => entry.data.archive !== false && !isReservedSlug(getEssaySlug(entry)));
}

export type ProjectEntry = CollectionEntry<'projects'>;

export type ProjectStatus = 'planned' | 'in-progress' | 'shipped' | 'paused' | 'archived';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  'planned': '计划中',
  'in-progress': '进行中',
  'shipped': '已发布',
  'paused': '暂停',
  'archived': '已归档'
};

export const getProjectSlug = (entry: ProjectEntry) => entry.data.slug ?? entry.id;

const orderByProjectDate = (a: ProjectEntry, b: ProjectEntry) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getSortedProjects() {
  return getPublished('projects', {
    orderBy: orderByProjectDate
  });
}
