import { z } from 'zod';

export const zOrder = z.object({
  id: z.string().uuid(),
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  quantity: z.number(),
  price: z.number().optional(),
  status: z.enum(['pending', 'open', 'filled', 'partially_filled', 'cancelled', 'rejected']),
  createdAt: z.string().datetime(),
});

export type Order = z.infer<typeof zOrder>;
