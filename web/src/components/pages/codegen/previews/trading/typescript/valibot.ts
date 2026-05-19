import * as v from 'valibot';

export const vOrder = v.object({
  id: v.pipe(v.string(), v.uuid()),
  symbol: v.string(),
  side: v.picklist(['buy', 'sell']),
  type: v.picklist(['market', 'limit', 'stop', 'stop_limit']),
  quantity: v.number(),
  price: v.optional(v.number()),
  status: v.picklist(['pending', 'open', 'filled', 'partially_filled', 'cancelled', 'rejected']),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
});

export type Order = v.InferOutput<typeof vOrder>;
