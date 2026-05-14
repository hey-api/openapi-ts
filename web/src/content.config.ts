import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: (ctx) =>
      docsSchema({
        extend: z.object({
          custom: z
            .object({
              version: z.string().optional(),
            })
            .optional(),
          og: z
            .object({
              image: ctx.image().optional(),
            })
            .optional(),
        }),
      })(ctx),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
