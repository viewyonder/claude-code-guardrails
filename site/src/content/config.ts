import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    author: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
