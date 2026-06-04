---
"@hey-api/openapi-ts": minor
"@hey-api/custom-client": minor
---

**feat(sdk)**: make the `meta` option typesafe via the augmentable `ClientMeta` interface

Each client now exports an empty, augmentable `ClientMeta` interface. Augment it (via `declare module`) to get autocomplete and type-checking for the SDK's `meta` option at the call site:

```ts
declare module '@hey-api/client-fetch' {
  interface ClientMeta {
    timeout?: number;
  }
}
```

This is fully backward compatible. The `meta` option resolves to `Record<string, unknown>` (exactly the previous type) while `ClientMeta` is left unaugmented, and becomes the strict `ClientMeta` — rejecting unknown keys and wrong-typed values — once you augment it.
