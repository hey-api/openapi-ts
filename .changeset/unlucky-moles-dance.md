---
'@hey-api/client-axios': minor
'@hey-api/client-fetch': minor
'@hey-api/client-next': minor
'@hey-api/client-nuxt': minor
'@hey-api/openapi-ts': minor
---

fix: make createConfig, CreateClientConfig, and Config accept ClientOptions generic

### Added `ClientOptions` interface

The `Config` interface now accepts an optional generic extending `ClientOptions` instead of `boolean` type `ThrowOnError`.

```ts
type Foo = Config<false> // [!code --]
type Foo = Config<{ throwOnError: false }> // [!code ++]
```
