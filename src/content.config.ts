import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const slugRule = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case');

const baseFields = {
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  archive: z.boolean().default(true),
  // Optional custom permalink. If present, it overrides the auto-generated id.
  slug: slugRule.optional()
};

const bitsImage = z.object({
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional()
});

const bitsAuthor = z.object({
  name: z.string().optional(),
  avatar: z.string().optional()
});

const essay = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essay' }),
  schema: z.object({
    ...baseFields,
    cover: z.string().optional(),
    badge: z.string().optional(),
    project: z.string().optional()
  })
});

const bits = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bits' }),
  schema: z.object({
    // Bits can be untitled.
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    slug: z.string().optional(),

    // Optional media for card display.
    images: z.array(bitsImage).optional(),
    author: bitsAuthor.optional()
  })
});

const memo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/memo' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    slug: z.string().optional()
  })
});

const projectStatus = z.enum(['planned', 'in-progress', 'shipped', 'paused', 'archived']);

const httpUrl = z.string().url().refine(
  (url) => {
    try {
      const protocol = new URL(url).protocol;
      return protocol === 'https:' || protocol === 'http:';
    } catch {
      return false;
    }
  },
  { message: 'URL must use http or https protocol' }
);

const projectLinks = z.object({
  github: httpUrl.optional(),
  demo: httpUrl.optional()
}).optional();

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    status: projectStatus.default('planned'),
    stack: z.array(z.string()).default([]),
    links: projectLinks,
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    slug: slugRule.optional(),
    relatedEssays: z.array(z.string()).default([])
  })
});

export const collections = { essay, bits, memo, projects };
