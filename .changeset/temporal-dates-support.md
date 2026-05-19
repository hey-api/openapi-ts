---
"@hey-api/openapi-ts": minor
---

**plugin(@hey-api/transformers)**: add `dates: 'temporal'` option. When set, `date-time` becomes `Temporal.Instant` and `date` becomes `Temporal.PlainDate`, with response transformers calling `Temporal.X.from(value)`. `Temporal` is imported from `temporal-polyfill`.
