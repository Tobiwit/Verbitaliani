import { z } from 'zod';
import { insertVerbSchema, verbs, TENSES } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  verbs: {
    list: {
      method: 'GET' as const,
      path: '/api/verbs',
      responses: {
        200: z.array(z.custom<typeof verbs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/verbs/:id',
      responses: {
        200: z.custom<typeof verbs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Optional: for importing data
    createBatch: {
      method: 'POST' as const,
      path: '/api/verbs/batch',
      input: z.array(insertVerbSchema),
      responses: {
        201: z.object({ count: z.number() }),
        400: errorSchemas.validation,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
