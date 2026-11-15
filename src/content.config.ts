import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const DOC_SECTIONS = [
  'getting-started',
  'notes',
  'studio',
  'agent',
  'guides',
] as const;

export type DocSection = (typeof DOC_SECTIONS)[number];

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(DOC_SECTIONS),
    order: z.number().default(100),
    badge: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
