import type { APIRoute } from 'astro';
import { getPublished } from '../../lib/content';
import { cleanMarkdownToText } from '../../utils/excerpt';

export const prerender = true;

const MAX_INDEX_TEXT = 600;

export const GET: APIRoute = async () => {
  const bits = await getPublished('bits', {
    orderBy: (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  });

  const index = bits.map((bit) => {
    const plain = cleanMarkdownToText(bit.body ?? '');
    const text = plain.length > MAX_INDEX_TEXT ? plain.slice(0, MAX_INDEX_TEXT) : plain;
    return {
      slug: bit.data.slug ?? bit.id,
      title: bit.data.title ?? '',
      description: bit.data.description ?? '',
      tags: bit.data.tags ?? [],
      text,
      date: bit.data.date ? bit.data.date.toISOString() : null
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
    }
  });
};
