# Changelog

## 2026-04-02

### @hey-api/openapi-ts 0.95.0

#### Core
- **internal**: remove `plugin.getSymbol` function ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))

#### @hey-api/client-angular
###### Fixed
- **@hey-api/client-angular**: improve `beforeRequest` typing ([#3660](https://github.com/hey-api/openapi-ts/pull/3660))

#### @hey-api/client-axios
###### Fixed
- **@hey-api/client-axios**: improve `beforeRequest` typing ([#3660](https://github.com/hey-api/openapi-ts/pull/3660))

#### @hey-api/client-fetch
###### Fixed
- **@hey-api/client-fetch**: improve `beforeRequest` typing ([#3660](https://github.com/hey-api/openapi-ts/pull/3660))

#### @hey-api/client-ky
###### Fixed
- **@hey-api/client-ky**: improve `beforeRequest` typing ([#3660](https://github.com/hey-api/openapi-ts/pull/3660))

#### @hey-api/client-next
###### Fixed
- **@hey-api/client-next**: improve `beforeRequest` typing ([#3660](https://github.com/hey-api/openapi-ts/pull/3660))

#### @hey-api/sdk
###### Changed
- **@hey-api/sdk**: improve types for SSE events ([#3466](https://github.com/hey-api/openapi-ts/pull/3466))

#### orpc
###### Fixed
- **orpc**: adjust input shape ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))

#### valibot
###### Changed
- **valibot**: remove request data schema ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))
- **valibot**: export request body, path, query, and headers schemas ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))

#### zod
###### Changed
- **zod**: remove request data schema ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))
- **zod**: export request body, path, query, and headers schemas ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))

---

### @hey-api/shared 0.3.0

### Added
- **plugins**: add request validator helpers ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))

### Changed
- **internal**: remove `plugin.getSymbol` function ([#3671](https://github.com/hey-api/openapi-ts/pull/3671))

---

## 2026-03-20

### @hey-api/openapi-ts 0.94.4

#### orpc
###### Changed
- **orpc**: initial release ([#3264](https://github.com/hey-api/openapi-ts/pull/3264))

---

## 2026-03-19

### @hey-api/openapi-ts 0.94.3

#### Core
- **output**: add `module` option ([#3616](https://github.com/hey-api/openapi-ts/pull/3616))
- **output**: pass context as second argument in `module.resolve` function ([#3615](https://github.com/hey-api/openapi-ts/pull/3615))
- **parser**: self-referencing discriminator ([#3601](https://github.com/hey-api/openapi-ts/pull/3601))

#### @hey-api/client-nuxt
###### Changed
- **@hey-api/client-nuxt**: preserve AbortSignal, FormData, and ReadableStream in unwrapRefs ([#3614](https://github.com/hey-api/openapi-ts/pull/3614))

#### @hey-api/transformers
###### Changed
- **@hey-api/transformers**: expose `plugin` and `$` in transformer function context ([#3610](https://github.com/hey-api/openapi-ts/pull/3610))

---

### @hey-api/codegen-core 0.7.4

### Changed
- **planner**: language-aware declaration sharing check ([#3606](https://github.com/hey-api/openapi-ts/pull/3606))

---

### @hey-api/shared 0.2.5

### Added
- **output**: add `module` option ([#3616](https://github.com/hey-api/openapi-ts/pull/3616))

### Fixed
- **parser**: self-referencing discriminator ([#3601](https://github.com/hey-api/openapi-ts/pull/3601))

### Changed
- **output**: pass context as second argument in `module.resolve` function ([#3615](https://github.com/hey-api/openapi-ts/pull/3615))

---

## 2026-03-16

### @hey-api/openapi-ts 0.94.2

#### Core
- **internal**: export Plugins namespace ([#3586](https://github.com/hey-api/openapi-ts/pull/3586))
- **internal**: expand TypeScript peer dependency range ([#3588](https://github.com/hey-api/openapi-ts/pull/3588))
- **output**: pass default value to `header` function ([#3585](https://github.com/hey-api/openapi-ts/pull/3585))

#### nestjs
###### Changed
- **nestjs**: initial release ([#3573](https://github.com/hey-api/openapi-ts/pull/3573))

---

### @hey-api/codegen-core 0.7.3

### Changed
- **internal**: remove TypeScript from peer dependencies ([#3566](https://github.com/hey-api/openapi-ts/pull/3566))

---

### @hey-api/shared 0.2.4

### Changed
- **internal**: remove TypeScript from peer dependencies ([#3566](https://github.com/hey-api/openapi-ts/pull/3566))
- **utils**: `outputHeaderToPrefix` function signature change ([#3585](https://github.com/hey-api/openapi-ts/pull/3585))

---

### @hey-api/types 0.1.4

### Changed
- **internal**: remove TypeScript from peer dependencies ([#3566](https://github.com/hey-api/openapi-ts/pull/3566))

---

## 2026-03-12

### @hey-api/openapi-ts 0.94.1

#### Core
- **cli**: show environment value in development ([#3546](https://github.com/hey-api/openapi-ts/pull/3546))

#### @hey-api/transformers
###### Fixed
- **@hey-api/transformers**: support `anyOf` schema with null ([#3504](https://github.com/hey-api/openapi-ts/pull/3504))

#### @hey-api/typescript
###### Added
- **@hey-api/typescript**: add Resolvers API ([#3531](https://github.com/hey-api/openapi-ts/pull/3531))
###### Changed
- **@hey-api/typescript**: implement `getName` symbol hook ([#3556](https://github.com/hey-api/openapi-ts/pull/3556))

#### valibot
###### Changed
- **valibot**: provide more resolvers ([#3547](https://github.com/hey-api/openapi-ts/pull/3547))
- **valibot**: implement `getName` symbol hook ([#3556](https://github.com/hey-api/openapi-ts/pull/3556))

#### zod
###### Changed
- **zod**: handle `guid` string format ([#3552](https://github.com/hey-api/openapi-ts/pull/3552))
- **zod**: implement `getName` symbol hook ([#3556](https://github.com/hey-api/openapi-ts/pull/3556))
- **zod**: provide more resolvers ([#3554](https://github.com/hey-api/openapi-ts/pull/3554))

- **config(plugins)**: show warning when plugin infer fails ([#3540](https://github.com/hey-api/openapi-ts/pull/3540))
- **dsl**: expand list of JavaScript globals ([#3508](https://github.com/hey-api/openapi-ts/pull/3508))

---

### @hey-api/codegen-core 0.7.2

### Changed
- **log**: make group optional in warn method ([#3540](https://github.com/hey-api/openapi-ts/pull/3540))

---

### @hey-api/shared 0.2.3

### Added
- **parser**: add `getName` symbol hook ([#3556](https://github.com/hey-api/openapi-ts/pull/3556))

### Changed
- **cli**: export isEnvironment function ([#3546](https://github.com/hey-api/openapi-ts/pull/3546))
- **internal**: export more IR types ([#3513](https://github.com/hey-api/openapi-ts/pull/3513))

---

## 2026-03-05

### @hey-api/openapi-ts 0.94.0

### ⚠️ Breaking
- **BREAKING** **client**: `buildUrl` function includes `baseUrl` from config by default ([#3491](https://github.com/hey-api/openapi-ts/pull/3491))

#### Core
- **internal**: simplify dev mode check ([#3498](https://github.com/hey-api/openapi-ts/pull/3498))
- **internal**: log symbol meta if name is falsy ([#3448](https://github.com/hey-api/openapi-ts/pull/3448))
- **output**: avoid double sanitizing leading character ([#3448](https://github.com/hey-api/openapi-ts/pull/3448))
- **parser**: explicit discriminator mapping wins over fallback in nested `allOf` ([#3490](https://github.com/hey-api/openapi-ts/pull/3490))

#### @pinia/colada
###### Fixed
- **@pinia/colada**: pass error type generic to `defineQueryOptions` ([#3483](https://github.com/hey-api/openapi-ts/pull/3483))

#### @tanstack/preact-query
###### Changed
- **@tanstack/preact-query**: initial release ([#3499](https://github.com/hey-api/openapi-ts/pull/3499))

#### @tanstack/react-query
###### Changed
- **@tanstack/react-query**: support generating `useMutation` hooks ([#3432](https://github.com/hey-api/openapi-ts/pull/3432))

#### typescript
###### Fixed
- **typescript**: reference enum object when creating enum types ([#3500](https://github.com/hey-api/openapi-ts/pull/3500))

#### valibot
###### Changed
- **valibot**: support function in `metadata` option ([#3497](https://github.com/hey-api/openapi-ts/pull/3497))

#### zod
###### Changed
- **zod**: support function in `metadata` option ([#3497](https://github.com/hey-api/openapi-ts/pull/3497))

- **BREAKING** **client**: `buildUrl` function includes `baseUrl` from config by default ([#3491](https://github.com/hey-api/openapi-ts/pull/3491))
- **client**: change serializer types from `any` to `unknown` ([#3471](https://github.com/hey-api/openapi-ts/pull/3471))
- **dsl(reserved)**: expand reserved keywords with more globals ([#3487](https://github.com/hey-api/openapi-ts/pull/3487))
- **output(header)**: support function signature in client and core files ([#3486](https://github.com/hey-api/openapi-ts/pull/3486))

---

### @hey-api/codegen-core 0.7.1

### Changed
- **internal**: log symbol meta if name is falsy ([#3448](https://github.com/hey-api/openapi-ts/pull/3448))

---

### @hey-api/shared 0.2.2

### Fixed
- **parser**: explicit discriminator mapping wins over fallback in nested `allOf` ([#3490](https://github.com/hey-api/openapi-ts/pull/3490))

### Changed
- **output**: context file is optional ([#3486](https://github.com/hey-api/openapi-ts/pull/3486))

---

## 2026-02-27

### @hey-api/openapi-ts 0.93.1

#### Core
- **cli**: do not set `logs.file` to `true` by default ([#3469](https://github.com/hey-api/openapi-ts/pull/3469))

#### @hey-api/sdk
###### Fixed
- **@hey-api/sdk**: correctly set required flat parameters ([#3458](https://github.com/hey-api/openapi-ts/pull/3458))

#### @hey-api/typescript
###### Changed
- **@hey-api/typescript**: simplify union types if a member is `unknown` ([#3454](https://github.com/hey-api/openapi-ts/pull/3454))

#### @tanstack/query
###### Fixed
- **@tanstack/query**: skip mutation queries for SSE endpoints ([#3470](https://github.com/hey-api/openapi-ts/pull/3470))

#### valibot
###### Added
- **valibot**: add `u` flag on regex patterns with unicode property escapes ([#3468](https://github.com/hey-api/openapi-ts/pull/3468))

#### zod
###### Added
- **zod**: add `u` flag on regex patterns with unicode property escapes ([#3468](https://github.com/hey-api/openapi-ts/pull/3468))
###### Fixed
- **zod**: apply nullable modifier to `additionalProperties` schema ([#3452](https://github.com/hey-api/openapi-ts/pull/3452))

- **client**: avoid removing empty arrays from flat arguments ([#3451](https://github.com/hey-api/openapi-ts/pull/3451))
- **client**: support async `createClientConfig` ([#3445](https://github.com/hey-api/openapi-ts/pull/3445))
- **client(@hey-api/nuxt)**: do not unwrap blob values ([#3459](https://github.com/hey-api/openapi-ts/pull/3459))

---

## 2026-02-24

### @hey-api/openapi-ts 0.93.0

#### Core
- **input**: improve returned status code when spec fetch fails ([#3427](https://github.com/hey-api/openapi-ts/pull/3427))
- **input**: avoid prefixing sources if paths do not collide on operations ([#3436](https://github.com/hey-api/openapi-ts/pull/3436))
- **output**: apply `output.header` to bundled files ([#3438](https://github.com/hey-api/openapi-ts/pull/3438))
- **parser**: add `patch.input` and shorthand `patch` option for full specification transformations ([#3411](https://github.com/hey-api/openapi-ts/pull/3411))
- **parser**: add support for non-string discriminator property types ([#3385](https://github.com/hey-api/openapi-ts/pull/3385))
- **parser**: preserve `unevaluatedProperties` keyword in transforms ([#3435](https://github.com/hey-api/openapi-ts/pull/3435))
- **parser**: resolve sibling schemas from external files during bundling ([#3422](https://github.com/hey-api/openapi-ts/pull/3422))
- **parser**: prefer unprefixed schema names from external files ([#3417](https://github.com/hey-api/openapi-ts/pull/3417))
- **parser**: handle OpenAPI 3.1 `contentMediaType` keyword as binary format when file-like ([#3431](https://github.com/hey-api/openapi-ts/pull/3431))

#### valibot
###### Changed
- **valibot**: remove `enum.nodes.nullable` resolver node ([#3396](https://github.com/hey-api/openapi-ts/pull/3396))
- **valibot**: use `.nullable` and `.nullish` methods ([#3396](https://github.com/hey-api/openapi-ts/pull/3396))

#### zod
###### Changed
- **zod**: remove `enum.nodes.nullable` resolver node ([#3398](https://github.com/hey-api/openapi-ts/pull/3398))
- **zod**: use `.nullable` and `.nullish` methods ([#3398](https://github.com/hey-api/openapi-ts/pull/3398))

- **client**: expose `onRequest` in RequestOptions for SSE request interception ([#3392](https://github.com/hey-api/openapi-ts/pull/3392))
- **parser(patch)**: support callback for `patch.schemas` ([#3415](https://github.com/hey-api/openapi-ts/pull/3415))
- **parser(patch)**: support callback for `patch.operations` ([#3420](https://github.com/hey-api/openapi-ts/pull/3420))
- **parser(transforms)**: add `schemaName` transform ([#3416](https://github.com/hey-api/openapi-ts/pull/3416))

---

### @hey-api/json-schema-ref-parser 1.3.1

### Fixed
- **input**: avoid prefixing sources if paths do not collide on operations ([#3436](https://github.com/hey-api/openapi-ts/pull/3436))
- **parser**: resolve sibling schemas from external files during bundling ([#3422](https://github.com/hey-api/openapi-ts/pull/3422))

### Changed
- **parser**: prefer unprefixed schema names from external files ([#3417](https://github.com/hey-api/openapi-ts/pull/3417))

---

### @hey-api/shared 0.2.1

### Added
- **parser**: add `patch.input` and shorthand `patch` option for full specification transformations ([#3411](https://github.com/hey-api/openapi-ts/pull/3411))
- **parser**: add support for non-string discriminator property types ([#3385](https://github.com/hey-api/openapi-ts/pull/3385))
- **parser(transforms)**: add `schemaName` transform ([#3416](https://github.com/hey-api/openapi-ts/pull/3416))

### Fixed
- **input**: improve returned status code when spec fetch fails ([#3427](https://github.com/hey-api/openapi-ts/pull/3427))
- **parser**: preserve `unevaluatedProperties` keyword in transforms ([#3435](https://github.com/hey-api/openapi-ts/pull/3435))

### Changed
- **internal**: export schema walker interfaces ([#3396](https://github.com/hey-api/openapi-ts/pull/3396))
- **parser**: handle OpenAPI 3.1 `contentMediaType` keyword as binary format when file-like ([#3431](https://github.com/hey-api/openapi-ts/pull/3431))
- **parser(patch)**: support callback for `patch.schemas` ([#3415](https://github.com/hey-api/openapi-ts/pull/3415))
- **parser(patch)**: support callback for `patch.operations` ([#3420](https://github.com/hey-api/openapi-ts/pull/3420))

---

## 2026-02-13

### @hey-api/openapi-ts 0.92.4

#### Core
- **internal**: use shared schema processor ([#3370](https://github.com/hey-api/openapi-ts/pull/3370))
- **output**: detect `importFileExtension` from tsconfig `module` option ([#3380](https://github.com/hey-api/openapi-ts/pull/3380))

#### @angular/common
###### Changed
- **@angular/common**: use generics for HttpRequests ([#3384](https://github.com/hey-api/openapi-ts/pull/3384))

#### @hey-api/client-nuxt
###### Fixed
- **@hey-api/client-nuxt**: forward `asyncDataOptions` to `useFetch` and `useLazyFetch` ([#3382](https://github.com/hey-api/openapi-ts/pull/3382))
###### Changed
- **@hey-api/client-nuxt**: unwrap `ComputedRef` body before initial serialization ([#3361](https://github.com/hey-api/openapi-ts/pull/3361))

#### @hey-api/transformers
###### Fixed
- **@hey-api/transformers**: false positive warning for discriminated `oneOf` schemas ([#3379](https://github.com/hey-api/openapi-ts/pull/3379))
- **@hey-api/transformers**: handle `$ref` keywords in `allOf` compositions ([#3374](https://github.com/hey-api/openapi-ts/pull/3374))

#### @hey-api/typescript
###### Fixed
- **@hey-api/typescript**: deduplicate enum keys to avoid name collision ([#3376](https://github.com/hey-api/openapi-ts/pull/3376))

---

### @hey-api/json-schema-ref-parser 1.3.0

### Changed
- **feat**: clean up dependencies ([#3386](https://github.com/hey-api/openapi-ts/pull/3386))
- **fix**: pass seen references through crawl stack ([#3387](https://github.com/hey-api/openapi-ts/pull/3387))

---

### @hey-api/shared 0.2.0

### Changed
- **utils**: rename `isTopLevelComponentRef` to `isTopLevelComponent` ([#3370](https://github.com/hey-api/openapi-ts/pull/3370))

---

## 2026-02-05

### @hey-api/openapi-ts 0.92.2

(No parsed entries)


---

### @hey-api/openapi-ts 0.92.3

#### zod
###### Changed
- **zod**: use namespace import for zod v4 ([#3325](https://github.com/hey-api/openapi-ts/pull/3325))

---

### @hey-api/codegen-core 0.7.0

### ⚠️ Breaking
- **BREAKING:** **symbol**: replace `exportFrom` array with `getExportFromFilePath` function ([#3322](https://github.com/hey-api/openapi-ts/pull/3322))

---

### @hey-api/shared 0.1.2

### Added
- **parser**: add `getExportFromFilePath` hook ([#3322](https://github.com/hey-api/openapi-ts/pull/3322))

### Changed
- **config**: `includeInEntry` accepts function in addition to primitive value ([#3322](https://github.com/hey-api/openapi-ts/pull/3322))
- **transform(read-write)**: improve discriminated schemas split ([#3322](https://github.com/hey-api/openapi-ts/pull/3322))

---

## 2026-01-30

### @hey-api/openapi-ts 0.91.1

(No parsed entries)


---

### @hey-api/codegen-core 0.6.1

### Fixed
- **planner**: fix duplicate import when same symbol is imported as both type and value ([#3291](https://github.com/hey-api/openapi-ts/pull/3291))

---

### @hey-api/shared 0.1.1

(No parsed entries)


---

## 2026-01-29

### @hey-api/openapi-ts 0.91.0

### ⚠️ Breaking
- **BREAKING**: Drop CommonJS (CJS) support. This package is now **ESM-only**. ([#3251](https://github.com/hey-api/openapi-ts/pull/3251))

- **BREAKING**: Drop CommonJS (CJS) support. This package is now **ESM-only**. ([#3251](https://github.com/hey-api/openapi-ts/pull/3251))

---

### @hey-api/codegen-core 0.6.0

### ⚠️ Breaking
- **BREAKING**: Drop CommonJS (CJS) support. This package is now **ESM-only**. ([#3251](https://github.com/hey-api/openapi-ts/pull/3251))

---

### @hey-api/shared 0.1.0

### Changed
- **feat**: initial release ([#3251](https://github.com/hey-api/openapi-ts/pull/3251))

---

### @hey-api/types 0.1.3

### Added
- **types**: add `AnyString` utility type ([#3251](https://github.com/hey-api/openapi-ts/pull/3251))

---

## 2026-01-25

### @hey-api/openapi-ts 0.90.10

#### Core
- **parser**: inline deep path `$ref` references ([#3242](https://github.com/hey-api/openapi-ts/pull/3242))

#### @hey-api/sdk
###### Changed
- **@hey-api/sdk**: correctly map body keys in flat mode ([#3255](https://github.com/hey-api/openapi-ts/pull/3255))

#### @tanstack/angular-query-experimental
###### Changed
- **@tanstack/angular-query-experimental**: index mutation options symbol ([#3249](https://github.com/hey-api/openapi-ts/pull/3249))

#### @tanstack/react-query
###### Changed
- **@tanstack/react-query**: index mutation options symbol ([#3253](https://github.com/hey-api/openapi-ts/pull/3253))

#### @tanstack/solid-query
###### Changed
- **@tanstack/solid-query**: index mutation options symbol ([#3253](https://github.com/hey-api/openapi-ts/pull/3253))

#### @tanstack/svelte-query
###### Changed
- **@tanstack/svelte-query**: index mutation options symbol ([#3253](https://github.com/hey-api/openapi-ts/pull/3253))

#### @tanstack/vue-query
###### Changed
- **@tanstack/vue-query**: index mutation options symbol ([#3253](https://github.com/hey-api/openapi-ts/pull/3253))

---

## 2026-01-23

### @hey-api/openapi-ts 0.90.9

#### Core
- **cli**: clean up interface ([#3244](https://github.com/hey-api/openapi-ts/pull/3244))
- **config**: move `loadConfigFile` function to `@hey-api/codegen-core` ([#3244](https://github.com/hey-api/openapi-ts/pull/3244))

- **ts-dsl**: allow removing object properties by passing `null` ([#3247](https://github.com/hey-api/openapi-ts/pull/3247))
- **ts-dsl**: override object properties when called multiple times with the same name ([#3247](https://github.com/hey-api/openapi-ts/pull/3247))

---

### @hey-api/codegen-core 0.5.5

### Changed
- **config**: export `loadConfigFile` function (moved from `@hey-api/openapi-ts`) ([#3244](https://github.com/hey-api/openapi-ts/pull/3244))

---

### @hey-api/types 0.1.2

### Added
- feat: add `ToArray`, `ToReadonlyArray`, and `AnyObject` types ([#3244](https://github.com/hey-api/openapi-ts/pull/3244))

---

## 2026-01-22

### @hey-api/openapi-ts 0.90.7

- **deps**: move @hey-api/types to dependencies to fix broken types ([#3232](https://github.com/hey-api/openapi-ts/pull/3232))

---

### @hey-api/openapi-ts 0.90.8

#### Core
- **cli**: do not show ascii logo on generate command ([#3238](https://github.com/hey-api/openapi-ts/pull/3238))
- **internal**: move logger to codegen-core ([#3235](https://github.com/hey-api/openapi-ts/pull/3235))

---

### @hey-api/codegen-core 0.5.3

### Changed
- **deps**: move @hey-api/types to dependencies to fix broken types ([#3232](https://github.com/hey-api/openapi-ts/pull/3232))

---

### @hey-api/codegen-core 0.5.4

### Changed
- **internal**: move logger to codegen-core ([#3235](https://github.com/hey-api/openapi-ts/pull/3235))

---

## 2026-01-21

### @hey-api/openapi-ts 0.90.6

#### @hey-api/sdk
###### Changed
- **@hey-api/sdk**: do not warn on mutualTLS security schemes ([#3227](https://github.com/hey-api/openapi-ts/pull/3227))

---

### @hey-api/types 0.1.1

### Changed
- Publish `@hey-api/types` so workspace packages can resolve it from npm. ([#3224](https://github.com/hey-api/openapi-ts/pull/3224))

---

## 2026-01-16

### @hey-api/openapi-ts 0.90.4

#### @hey-api/client-fetch
###### Fixed
- **@hey-api/client-fetch**: JSON parsing error on empty response bodies without Content-Length header ([#3201](https://github.com/hey-api/openapi-ts/pull/3201))

#### @hey-api/client-ky
###### Fixed
- **@hey-api/client-ky**: JSON parsing error on empty response bodies without Content-Length header ([#3201](https://github.com/hey-api/openapi-ts/pull/3201))

#### @hey-api/client-next
###### Fixed
- **@hey-api/client-next**: JSON parsing error on empty response bodies without Content-Length header ([#3201](https://github.com/hey-api/openapi-ts/pull/3201))

#### valibot
###### Added
- **valibot**: add `enum` resolver ([#3209](https://github.com/hey-api/openapi-ts/pull/3209))

#### zod
###### Added
- **zod**: add `enum` resolver ([#3209](https://github.com/hey-api/openapi-ts/pull/3209))

---

## 2026-01-11

### @hey-api/openapi-ts 0.90.3

#### Core
- **output**: add `oxfmt` preset ([#3197](https://github.com/hey-api/openapi-ts/pull/3197))

---

## 2026-01-07

### @hey-api/openapi-ts 0.90.2

#### Core
- **build**: do not minify bundles for better code readability and debugging ([#3186](https://github.com/hey-api/openapi-ts/pull/3186))

#### @hey-api/sdk
###### Fixed
- **@hey-api/sdk**: do not use bodySerializer if format is binary ([#3190](https://github.com/hey-api/openapi-ts/pull/3190))

---

### @hey-api/vite-plugin 0.2.1

### Changed
- **build**: do not minify bundles for better code readability and debugging ([#3186](https://github.com/hey-api/openapi-ts/pull/3186))

---

### @hey-api/codegen-core 0.5.2

### Changed
- **build**: do not minify bundles for better code readability and debugging ([#3186](https://github.com/hey-api/openapi-ts/pull/3186))

---

## 2026-01-04

### @hey-api/openapi-ts 0.90.1

#### Core
- **output**: add `source` option ([#3175](https://github.com/hey-api/openapi-ts/pull/3175))

#### @hey-api/sdk
###### Added
- **@hey-api/sdk**: add `examples` option ([#3175](https://github.com/hey-api/openapi-ts/pull/3175))

---

### @hey-api/codegen-core 0.5.1

### Changed
- **project**: expose `.plan` method ([#3175](https://github.com/hey-api/openapi-ts/pull/3175))

---

## 2026-01-03

### @hey-api/openapi-ts 0.90.0

### ⚠️ Breaking
- **valibot**: **BREAKING:** standardize `~resolvers` API ([#3147](https://github.com/hey-api/openapi-ts/pull/3147))
- **sdk**: **BREAKING**: Structure API ([#3109](https://github.com/hey-api/openapi-ts/pull/3109))
- **zod**: **BREAKING:** standardize `~resolvers` API ([#3147](https://github.com/hey-api/openapi-ts/pull/3147))
- **@angular/common**: **BREAKING**: Structure API ([#3109](https://github.com/hey-api/openapi-ts/pull/3109))

#### @angular/common
###### Breaking
- **@angular/common**: **BREAKING**: Structure API ([#3109](https://github.com/hey-api/openapi-ts/pull/3109))

#### @hey-api/client-angular
###### Changed
- **@hey-api/client-angular**: use serialized body in SSE requests ([#3171](https://github.com/hey-api/openapi-ts/pull/3171))

#### @hey-api/client-axios
###### Changed
- **@hey-api/client-axios**: use serialized body in SSE requests ([#3171](https://github.com/hey-api/openapi-ts/pull/3171))

#### @hey-api/client-fetch
###### Changed
- **@hey-api/client-fetch**: use serialized body in SSE requests ([#3171](https://github.com/hey-api/openapi-ts/pull/3171))

#### @hey-api/client-ky
###### Changed
- **@hey-api/client-ky**: use serialized body in SSE requests ([#3171](https://github.com/hey-api/openapi-ts/pull/3171))

#### @hey-api/client-next
###### Changed
- **@hey-api/client-next**: use serialized body in SSE requests ([#3171](https://github.com/hey-api/openapi-ts/pull/3171))

#### @hey-api/client-nuxt
###### Changed
- **@hey-api/client-nuxt**: use serialized body in SSE requests ([#3123](https://github.com/hey-api/openapi-ts/pull/3123))
- **@hey-api/client-nuxt**: preserve null in `WithRefs` type for nullable fields ([#3131](https://github.com/hey-api/openapi-ts/pull/3131))

#### sdk
###### Breaking
- **sdk**: **BREAKING**: Structure API ([#3109](https://github.com/hey-api/openapi-ts/pull/3109))

#### valibot
###### Breaking
- **valibot**: **BREAKING:** standardize `~resolvers` API ([#3147](https://github.com/hey-api/openapi-ts/pull/3147))

#### zod
###### Breaking
- **zod**: **BREAKING:** standardize `~resolvers` API ([#3147](https://github.com/hey-api/openapi-ts/pull/3147))
###### Changed
- **zod**: expand support for bigint types ([#3145](https://github.com/hey-api/openapi-ts/pull/3145))

- **renderer**: correctly render default import ([#3109](https://github.com/hey-api/openapi-ts/pull/3109))

---

### @hey-api/codegen-core 0.5.0

### Changed
- **core**: Structure API ([#3109](https://github.com/hey-api/openapi-ts/pull/3109))
- **fix**: simplify symbol merging logic ([#3169](https://github.com/hey-api/openapi-ts/pull/3169))
- **types**: document default values for `importKind` and `kind` ([#3147](https://github.com/hey-api/openapi-ts/pull/3147))

---

## 2025-12-20

### @hey-api/openapi-ts 0.89.2

#### @hey-api/client-axios
###### Changed
- **@hey-api/client-axios**: revert use `query` option when no `paramsSerializer` is provided ([#3125](https://github.com/hey-api/openapi-ts/pull/3125))

#### @hey-api/typescript
###### Changed
- **@hey-api/typescript**: improve type narrowing in discriminated types ([#3120](https://github.com/hey-api/openapi-ts/pull/3120))

---

## 2025-12-19

### @hey-api/openapi-ts 0.89.1

#### Core
- **output**: sanitize reserved names with underscore suffix instead of prefix ([#3102](https://github.com/hey-api/openapi-ts/pull/3102))
- **output**: default to `.js` extension when module resolution is set to `node16` ([#3115](https://github.com/hey-api/openapi-ts/pull/3115))
- **parser**: expose OpenAPI extension keywords ([#3119](https://github.com/hey-api/openapi-ts/pull/3119))
- **parser**: improve discriminator support in nested `allOf` fields ([#3117](https://github.com/hey-api/openapi-ts/pull/3117))

#### @hey-api/client-axios
###### Changed
- **@hey-api/client-axios**: use `query` option when no `paramsSerializer` is provided ([#3062](https://github.com/hey-api/openapi-ts/pull/3062))

#### @hey-api/sdk
###### Changed
- **@hey-api/sdk**: lazily initialize sub-resources to improve performance ([#3099](https://github.com/hey-api/openapi-ts/pull/3099))

---

## 2025-12-11

### @hey-api/openapi-ts 0.89.0

#### Core
- **output**: add `preferExportAll` option ([#2990](https://github.com/hey-api/openapi-ts/pull/2990))
- **output**: add `nameConflictResolver` option ([#2990](https://github.com/hey-api/openapi-ts/pull/2990))
- **parser**: removed `symbol:setValue:*` events ([#2990](https://github.com/hey-api/openapi-ts/pull/2990))

---

### @hey-api/codegen-core 0.4.0

### Changed
- **symbols**: remove `placeholder` property ([#2990](https://github.com/hey-api/openapi-ts/pull/2990))

---

## 2025-12-10

### @hey-api/openapi-ts 0.88.2

No user-facing changes.


---

## 2025-12-08

### @hey-api/openapi-ts 0.88.1

- **@hey-api/sdk**: correctly map flat parameters ([#3047](https://github.com/hey-api/openapi-ts/pull/3047))

---

## 2025-11-20

### @hey-api/openapi-ts 0.88.0

#### Core
- **output**: use TypeScript DSL ([#2986](https://github.com/hey-api/openapi-ts/pull/2986))

---

## 2025-11-14

### @hey-api/openapi-ts 0.87.5

- **client-ofetch**: fix FormData boundary mismatch ([#2940](https://github.com/hey-api/openapi-ts/pull/2940))

---

## 2025-11-13

### @hey-api/openapi-ts 0.87.3

- **@tanstack/query**: add type annotations to `queryOptions` ([#2964](https://github.com/hey-api/openapi-ts/pull/2964))
- **@tanstack/query**: prettier mutation options ([#2972](https://github.com/hey-api/openapi-ts/pull/2972))
- **client-fetch**: intercept AbortError ([#2970](https://github.com/hey-api/openapi-ts/pull/2970))
- **valibot**: allow generating custom pipes with `~resolvers` ([#2975](https://github.com/hey-api/openapi-ts/pull/2975))
- **zod**: allow generating custom chains with `~resolvers` ([#2975](https://github.com/hey-api/openapi-ts/pull/2975))

---

### @hey-api/openapi-ts 0.87.4

- **valibot**: expose validator resolvers ([#2980](https://github.com/hey-api/openapi-ts/pull/2980))
- **zod**: expose validator resolvers ([#2980](https://github.com/hey-api/openapi-ts/pull/2980))

---

## 2025-11-11

### @hey-api/openapi-ts 0.87.2

#### Core
- **output**: run lint before format ([#2937](https://github.com/hey-api/openapi-ts/pull/2937))
- **parser**: merge `default` keyword with `$ref` in OpenAPI 3.1 ([#2946](https://github.com/hey-api/openapi-ts/pull/2946))

- **@pinia/colada**: correctly access instantiated SDKs ([#2942](https://github.com/hey-api/openapi-ts/pull/2942))
- **@tanstack/query**: prettier query options ([#2947](https://github.com/hey-api/openapi-ts/pull/2947))
- **clients**: add support for Ky client ([#2958](https://github.com/hey-api/openapi-ts/pull/2958))
- **valibot**: use `.strictObject` instead of `.objectWithRest` when additional properties are not allowed ([#2945](https://github.com/hey-api/openapi-ts/pull/2945))

---

## 2025-11-07

### @hey-api/openapi-ts 0.87.1

- fix(typescript): remove legacy options ([#2929](https://github.com/hey-api/openapi-ts/pull/2929))
- fix(tanstack-query): correctly access instantiated SDKs ([#2939](https://github.com/hey-api/openapi-ts/pull/2939))

---

## 2025-11-04

### @hey-api/openapi-ts 0.86.12

- fix(transformers): do not reference undefined transformers ([#2924](https://github.com/hey-api/openapi-ts/pull/2924))
- fix(sdk): add `paramsStructure` option ([#2909](https://github.com/hey-api/openapi-ts/pull/2909))
- fix(sdk): handle conflicts between method names and subclasses in class-based SDKs ([#2920](https://github.com/hey-api/openapi-ts/pull/2920))
- bundled context types ([#2923](https://github.com/hey-api/openapi-ts/pull/2923))

---

### @hey-api/openapi-ts 0.87.0

- feat: remove legacy clients and plugins ([#2925](https://github.com/hey-api/openapi-ts/pull/2925))

---

### @hey-api/codegen-core 0.3.3

### Fixed
- remove most of readonly properties to allow mutating in place ([#2919](https://github.com/hey-api/openapi-ts/pull/2919))
- update types ([#2909](https://github.com/hey-api/openapi-ts/pull/2909))

---

## 2025-10-31

### @hey-api/openapi-ts 0.86.10

- fix(parser): handle OpenAPI 2.0 body as JSON by default if not explicitly defined ([#2893](https://github.com/hey-api/openapi-ts/pull/2893))

---

### @hey-api/openapi-ts 0.86.11

- fix(types): use unique generic names in `PluginInstance` to avoid typing issues ([#2897](https://github.com/hey-api/openapi-ts/pull/2897))

---

### @hey-api/openapi-ts 0.86.9

- fix(valibot): handle `time` string format ([#2889](https://github.com/hey-api/openapi-ts/pull/2889))
- gracefully handle errors in debug reports ([#2884](https://github.com/hey-api/openapi-ts/pull/2884))
- refactor: replace plugin references with queries ([#2873](https://github.com/hey-api/openapi-ts/pull/2873))

---

### @hey-api/codegen-core 0.3.2

### Added
- feat: add `.query` method to symbol registry ([#2873](https://github.com/hey-api/openapi-ts/pull/2873))

---

## 2025-10-28

### @hey-api/openapi-ts 0.86.8

- fix(valibot): improve handling of additionalProperties type ([#2870](https://github.com/hey-api/openapi-ts/pull/2870))

---

## 2025-10-27

### @hey-api/openapi-ts 0.86.5

- fix(parser): write-only schema incorrectly used in response schemas ([#2850](https://github.com/hey-api/openapi-ts/pull/2850))
- fix(cli): move cli script to typescript ([#2852](https://github.com/hey-api/openapi-ts/pull/2852))

---

### @hey-api/openapi-ts 0.86.6

- fix(transformers): revert function order to fix infinite cycle regression ([#2855](https://github.com/hey-api/openapi-ts/pull/2855))

---

### @hey-api/openapi-ts 0.86.7

- fix(types): export Operation type ([#2862](https://github.com/hey-api/openapi-ts/pull/2862))

---

## 2025-10-25

### @hey-api/openapi-ts 0.86.4

- feat(parser): pass tags to symbol meta ([#2845](https://github.com/hey-api/openapi-ts/pull/2845))
- feat(clients): granular query parameter serialization strategy ([#2837](https://github.com/hey-api/openapi-ts/pull/2837))

---

## 2025-10-24

### @hey-api/openapi-ts 0.86.3

- feat(parser): add `events` hooks ([#2829](https://github.com/hey-api/openapi-ts/pull/2829))
- fix(parser): writeOnly schema properties missing from request types in nested schemas ([#2793](https://github.com/hey-api/openapi-ts/pull/2793))

---

## 2025-10-23

### @hey-api/openapi-ts 0.86.2

- fix(validators): do not reference variables before they are declared ([#2812](https://github.com/hey-api/openapi-ts/pull/2812))
- fix(renderer): allow duplicate names when one symbol is a type ([#2812](https://github.com/hey-api/openapi-ts/pull/2812))

---

### @hey-api/codegen-core 0.3.1

### Added
- feat: add `isRegistered` method to file and symbol registry ([#2812](https://github.com/hey-api/openapi-ts/pull/2812))

---

## 2025-10-20

### @hey-api/openapi-ts 0.86.1

- fix(client-axios): revert return error when axios request fails ([#2804](https://github.com/hey-api/openapi-ts/pull/2804))

---

## 2025-10-19

### @hey-api/openapi-ts 0.86.0

- feat: bump minimum Node version to 20.19.0 ([#2775](https://github.com/hey-api/openapi-ts/pull/2775))
- do not print error details if logs are set to silent ([#2776](https://github.com/hey-api/openapi-ts/pull/2776))
- fix(client-axios): return error when axios request fails ([#2763](https://github.com/hey-api/openapi-ts/pull/2763))

---

### @hey-api/codegen-core 0.3.0

### Added
- feat: bump minimum Node version to 20.19.0 ([#2775](https://github.com/hey-api/openapi-ts/pull/2775))

---

## 2025-10-13

### @hey-api/openapi-ts 0.85.2

- dynamically load c12 to work with cjs modules ([#2755](https://github.com/hey-api/openapi-ts/pull/2755))
- fix(cli): detect watch mode with input array ([#2751](https://github.com/hey-api/openapi-ts/pull/2751))

---

## 2025-10-08

### @hey-api/openapi-ts 0.85.1

- fix(zod): allOf in array items being generated as union instead of intersection ([#2736](https://github.com/hey-api/openapi-ts/pull/2736))

---

## 2025-10-06

### @hey-api/openapi-ts 0.85.0

- feat: support multiple configurations ([#2602](https://github.com/hey-api/openapi-ts/pull/2602))
- feat(config): add `output.importFileExtension` option ([#2718](https://github.com/hey-api/openapi-ts/pull/2718))
- feat(pinia-colada): query options use `defineQueryOptions` ([#2610](https://github.com/hey-api/openapi-ts/pull/2610))
- refactor(config): replace 'off' with null to disable options ([#2718](https://github.com/hey-api/openapi-ts/pull/2718))

---

## 2025-09-30

### @hey-api/openapi-ts 0.84.4

- fix(client-ofetch): add missing credentials property support ([#2710](https://github.com/hey-api/openapi-ts/pull/2710))
- fix(config): do not override interactive config from CLI if defined in config file ([#2708](https://github.com/hey-api/openapi-ts/pull/2708))
- fix(zod): correct schemas for numeric and boolean enums ([#2704](https://github.com/hey-api/openapi-ts/pull/2704))

---

## 2025-09-25

### @hey-api/openapi-ts 0.84.3

- fix(validators): escaping slashes in regular expressions ([#2692](https://github.com/hey-api/openapi-ts/pull/2692))

---

## 2025-09-24

### @hey-api/openapi-ts 0.84.2

- fix(parser): add `propertiesRequiredByDefault` transform option ([#2678](https://github.com/hey-api/openapi-ts/pull/2678))
- fix(typescript): do not mark enums as types ([#2680](https://github.com/hey-api/openapi-ts/pull/2680))

---

## 2025-09-23

### @hey-api/openapi-ts 0.84.1

- feat: add `ofetch` client available as `@hey-api/client-ofetch` ([#2642](https://github.com/hey-api/openapi-ts/pull/2642))
- fix(renderer): replace default import placeholder ([#2674](https://github.com/hey-api/openapi-ts/pull/2674))

---

## 2025-09-22

### @hey-api/openapi-ts 0.84.0

- feat: Symbol API
- fix(plugin): every plugin extends Plugin.Hooks interface ([#2664](https://github.com/hey-api/openapi-ts/pull/2664))
- fix(renderer): group and sort imported modules
- fix(parser): expand schema deduplication by including validation constraints in type ID ([#2650](https://github.com/hey-api/openapi-ts/pull/2650))
- fix(parser): bump support for OpenAPI 3.1.2 ([#2667](https://github.com/hey-api/openapi-ts/pull/2667))
- fix(config): add `output.fileName` option ([#2664](https://github.com/hey-api/openapi-ts/pull/2664))

---

### @hey-api/codegen-core 0.2.0

### Added
- feat: Symbol API ([#2664](https://github.com/hey-api/openapi-ts/pull/2664))

---

## 2025-09-11

### @hey-api/openapi-ts 0.83.1

No user-facing changes.


---

## 2025-09-10

### @hey-api/openapi-ts 0.83.0

- feat: Symbol API
- feat(pinia-colada): remove `groupByTag` option

---

### @hey-api/codegen-core 0.1.0

### Added
- feat: expand Symbol API ([#2582](https://github.com/hey-api/openapi-ts/pull/2582))

---

## 2025-09-07

### @hey-api/openapi-ts 0.82.5

- fix(client): `mergeHeaders` functions use `.forEach` instead of `.entries` ([#2585](https://github.com/hey-api/openapi-ts/pull/2585))
- fix(client): move `getValidRequestBody` function to `client-core` ([#2605](https://github.com/hey-api/openapi-ts/pull/2605))

---

## 2025-09-05

### @hey-api/openapi-ts 0.82.4

- feat(pinia-colada): implicit `$fetch` for `client-nuxt` (hide `composable`) ([#2598](https://github.com/hey-api/openapi-ts/pull/2598))
- fix(client): improve handling of plain text, falsy, and unserialized request bodies ([#2564](https://github.com/hey-api/openapi-ts/pull/2564))
- fix(pinia-colada): optional `options` in mutation factory ([#2593](https://github.com/hey-api/openapi-ts/pull/2593))
- fix(parser): improve $ref handling ([#2588](https://github.com/hey-api/openapi-ts/pull/2588))

---

## 2025-09-01

### @hey-api/nuxt 0.2.1

### Fixed
- update peer dependencies to be more permissible ([#2574](https://github.com/hey-api/openapi-ts/pull/2574))

---

## 2025-08-30

### @hey-api/openapi-ts 0.82.1

- Thanks @ixnas! - feat(typescript): add `typescript-const` to `enums.mode` for generating TypeScript enums as constants ([#2541](https://github.com/hey-api/openapi-ts/pull/2541))
- Thanks @carson2222! - fix(parser): prune `required` array after removing properties ([#2556](https://github.com/hey-api/openapi-ts/pull/2556))
- Thanks @jgoz! - fix(output): avoid appending `.gen` to file names multiple times when `output.clean` is `false` ([#2559](https://github.com/hey-api/openapi-ts/pull/2559))

---

## 2025-08-29

### @hey-api/openapi-ts 0.82.0

- Thanks @SebastiaanWouters! - feat(parser): add Hooks API ([#2505](https://github.com/hey-api/openapi-ts/pull/2505))
- Thanks @mrlubos! - fix(client): pass fetch option to sse client ([#2542](https://github.com/hey-api/openapi-ts/pull/2542))
- Thanks @SebastiaanWouters! - feat(plugin): add `@pinia/colada` plugin ([#2505](https://github.com/hey-api/openapi-ts/pull/2505))
- Thanks @alexedme! - feat(client): added angular, axios, fetch, next & nuxt client type export for external typing purposes. ([#2535](https://github.com/hey-api/openapi-ts/pull/2535))
- Thanks @carson2222! - fix(parser): improve handling multiple references to shared external variable ([#2544](https://github.com/hey-api/openapi-ts/pull/2544))
- Thanks @volesen! - fix(client): improve empty response body handling ([#2519](https://github.com/hey-api/openapi-ts/pull/2519))
- Thanks @josh-hemphill! - feat(plugin): add `@pinia/colada` plugin ([#1680](https://github.com/hey-api/openapi-ts/pull/1680))
- Thanks @carson2222! - fix(parser): improve `readWrite` transformer splitting logic ([#2530](https://github.com/hey-api/openapi-ts/pull/2530))
- Thanks @carson2222! - fix(parser): handle `patternProperties` in OpenAPI 3.1 ([#2523](https://github.com/hey-api/openapi-ts/pull/2523))

---

## 2025-08-24

### @hey-api/openapi-ts 0.81.1

- Thanks @mrlubos! - feat(typescript): add webhooks configuration options ([#2516](https://github.com/hey-api/openapi-ts/pull/2516))
- Thanks @malcolm-kee! - fix(parser): correctly handle schema extending discriminated schema ([#2515](https://github.com/hey-api/openapi-ts/pull/2515))
- Thanks @mrlubos! - fix(client): move sse functions into their own namespace ([#2513](https://github.com/hey-api/openapi-ts/pull/2513))
- Thanks @mrlubos! - feat(validator): add webhooks configuration options ([#2516](https://github.com/hey-api/openapi-ts/pull/2516))
- Thanks @mrlubos! - feat(parser): handle webhooks in OpenAPI 3.1 ([#2516](https://github.com/hey-api/openapi-ts/pull/2516))

---

## 2025-08-23

### @hey-api/openapi-ts 0.81.0

- Thanks @mrlubos! - feat(client): add support for server-sent events (SSE) ([#2510](https://github.com/hey-api/openapi-ts/pull/2510))

---

## 2025-08-21

### @hey-api/openapi-ts 0.80.16

- Thanks @mrlubos! - fix(client): Nuxt client receives raw body in request validators ([#2490](https://github.com/hey-api/openapi-ts/pull/2490))
- Thanks @dracomithril! - fix(parser): deduplicate security schemas based on name ([#2479](https://github.com/hey-api/openapi-ts/pull/2479))
- Thanks @mrlubos! - feat(parser): input supports Hey API Registry shorthand ([#2489](https://github.com/hey-api/openapi-ts/pull/2489))
- Thanks @bombillazo! - feat(parser): input supports ReadMe API Registry with `readme:` prefix ([#2485](https://github.com/hey-api/openapi-ts/pull/2485))
- Thanks @mrlubos! - feat(parser): input supports Scalar API Registry with `scalar:` prefix ([#2491](https://github.com/hey-api/openapi-ts/pull/2491))

---

### @hey-api/openapi-ts 0.80.17

- Thanks @max-scopp! - fix(client): Angular client correctly applies default GET method ([#2500](https://github.com/hey-api/openapi-ts/pull/2500))

---

### @hey-api/openapi-ts 0.80.18

- Thanks @malcolm-kee! - fix(parser): OpenAPI 3.1 parser handles multiple `type` values ([#2502](https://github.com/hey-api/openapi-ts/pull/2502))

---

## 2025-08-20

### @hey-api/openapi-ts 0.80.15

- Thanks @dracomithril! - fix(client): call `auth` function for every unique security `name` ([#2480](https://github.com/hey-api/openapi-ts/pull/2480))
- Thanks @mrlubos! - fix(parser): cache parent to children nodes ([#2481](https://github.com/hey-api/openapi-ts/pull/2481))

---

## 2025-08-19

### @hey-api/openapi-ts 0.80.14

- Thanks @mrlubos! - fix(parser): cache visited graph nodes to boost performance ([#2475](https://github.com/hey-api/openapi-ts/pull/2475))

---

## 2025-08-18

### @hey-api/openapi-ts 0.80.12

- Thanks @bjornhenriksson! - fix(zod): add `dates.local` option to allow unqualified (timezone-less) datetimes ([#2467](https://github.com/hey-api/openapi-ts/pull/2467))

---

### @hey-api/openapi-ts 0.80.13

- Thanks @josstn! - fix(parser): handle non-ascii characters in discriminator ([#2471](https://github.com/hey-api/openapi-ts/pull/2471))

---

## 2025-08-16

### @hey-api/openapi-ts 0.80.11

- Thanks @mrlubos! - feat(client): add `@hey-api/client-angular` client ([#2452](https://github.com/hey-api/openapi-ts/pull/2452))
- Thanks @max-scopp! - feat(plugin): add `@angular/common` plugin ([#2423](https://github.com/hey-api/openapi-ts/pull/2423))

---

## 2025-08-14

### @hey-api/openapi-ts 0.80.10

- Thanks @mrlubos! - fix(client): handle dates in formdata serializer ([#2438](https://github.com/hey-api/openapi-ts/pull/2438))

---

## 2025-08-13

### @hey-api/openapi-ts 0.80.9

- Thanks @flow96! - fix(sdk): handle infinite loop in nested operation IDs and tags with duplicate values ([#2426](https://github.com/hey-api/openapi-ts/pull/2426))

---

## 2025-08-11

### @hey-api/openapi-ts 0.80.8

- Thanks @mrlubos! - fix(client): add auto-generated header to client files ([#2418](https://github.com/hey-api/openapi-ts/pull/2418))
- Thanks @mrlubos! - fix(client): correctly rename client files with nodenext bundler ([#2418](https://github.com/hey-api/openapi-ts/pull/2418))
- Thanks @mrlubos! - fix(tanstack-query): set correct name for pagination parameters in infinite query options ([#2416](https://github.com/hey-api/openapi-ts/pull/2416))

---

## 2025-08-09

### @hey-api/openapi-ts 0.80.6

- Thanks @ahmedrowaihi! - feat(tanstack-query): support generating `meta` fields ([#2399](https://github.com/hey-api/openapi-ts/pull/2399))
- Thanks @dovca! - feat(clients): pass raw `body` to interceptors, provide serialized body in `serializedBody` ([#2406](https://github.com/hey-api/openapi-ts/pull/2406))
- Thanks @flow96! - fix(sdk): prevent infinite loop when a schema tag matches operation ID ([#2407](https://github.com/hey-api/openapi-ts/pull/2407))

---

### @hey-api/openapi-ts 0.80.7

- Thanks @Shinigami92! - fix(client): add `.gen` to client files ([#2396](https://github.com/hey-api/openapi-ts/pull/2396))

---

## 2025-08-07

### @hey-api/openapi-ts 0.80.5

- Thanks @mrclrchtr! - fix: resolve Yarn PnP compatibility issues with client bundle generation ([#2401](https://github.com/hey-api/openapi-ts/pull/2401))

---

## 2025-08-06

### @hey-api/openapi-ts 0.80.3

- Thanks @MaxwellAt! - fix(zod): improve handling of additional properties ([#2287](https://github.com/hey-api/openapi-ts/pull/2287))

---

### @hey-api/openapi-ts 0.80.4

- Thanks @ahmedrowaihi! - fix(tanstack-query): add `queryKeys.tags` and `infiniteQueryKeys.tags` options ([#2391](https://github.com/hey-api/openapi-ts/pull/2391))

---

## 2025-08-03

### @hey-api/openapi-ts 0.80.2

- Thanks @j-ibarra! - fix(transformers): add `typeTransformers` option allowing passing custom transform functions ([#2383](https://github.com/hey-api/openapi-ts/pull/2383))
- Thanks @idbenami! - fix(client-axios): allow passing `AxiosInstance` into `axios` field ([#2382](https://github.com/hey-api/openapi-ts/pull/2382))

---

## 2025-07-24

### @hey-api/openapi-ts 0.80.1

- Thanks @Daschi1! - fix(valibot): expand support for `format: int64` ([#2344](https://github.com/hey-api/openapi-ts/pull/2344))

---

## 2025-07-23

### @hey-api/openapi-ts 0.80.0

- Thanks @mrlubos! - feat(zod): add support for Zod 4 and Zod Mini ([#2341](https://github.com/hey-api/openapi-ts/pull/2341))

---

## 2025-07-22

### @hey-api/openapi-ts 0.79.2

- Thanks @Le0Developer! - fix(typescript): add support for TypeID types ([#2034](https://github.com/hey-api/openapi-ts/pull/2034))
- Thanks @alexvuka1! - fix(parser): respect `output.case` when generating operation id ([#2041](https://github.com/hey-api/openapi-ts/pull/2041))

---

## 2025-07-21

### @hey-api/openapi-ts 0.79.1

- Thanks @mrlubos! - fix: respect NO_INTERACTIVE and NO_INTERACTION environment variables ([#2336](https://github.com/hey-api/openapi-ts/pull/2336))
- Thanks @mrlubos! - fix(client): update Axios headers types ([#2331](https://github.com/hey-api/openapi-ts/pull/2331))
- Thanks @mrlubos! - fix: improve handlebars types for jsr compliance ([#2334](https://github.com/hey-api/openapi-ts/pull/2334))
- Thanks @mrlubos! - fix(tanstack-query): set query key base url from options if defined ([#2333](https://github.com/hey-api/openapi-ts/pull/2333))

---

## 2025-07-20

### @hey-api/openapi-ts 0.79.0

- Thanks @mrlubos! - fix(typescript): removed `typescript+namespace` enums mode ([#2284](https://github.com/hey-api/openapi-ts/pull/2284))

---

## 2025-07-10

### @hey-api/openapi-ts 0.78.3

- Thanks @btmnk! - fix(client): improve types to pass `@total-typescript/ts-reset` rules ([#2290](https://github.com/hey-api/openapi-ts/pull/2290))

---

## 2025-07-07

### @hey-api/openapi-ts 0.78.2

- Thanks @j-ibarra! - fix(transformers): add `transformers` option allowing passing custom transform functions ([#2281](https://github.com/hey-api/openapi-ts/pull/2281))

---

## 2025-07-05

### @hey-api/openapi-ts 0.78.0

- Thanks @mrlubos! - feat(config): add `parser` options ([#2246](https://github.com/hey-api/openapi-ts/pull/2246))
- `input.filters` moved to `parser.filters`
- `input.pagination` moved to `parser.pagination`
- `input.patch` moved to `parser.patch`
- `input.validate_EXPERIMENTAL` moved to `parser.validate_EXPERIMENTAL`
- `enumsCase` moved to `enums.case`
- `enumsConstantsIgnoreNull` moved to `enums.constantsIgnoreNull`
- `exportInlineEnums` moved to `parser.transforms.enums`
- `readOnlyWriteOnlyBehavior` moved to `parser.transforms.readWrite.enabled`
- `readableNameBuilder` moved to `parser.transforms.readWrite.responses.name`
- `writableNameBuilder` moved to `parser.transforms.readWrite.requests.name`
- Thanks @mrlubos! - fix(config): add `operations` option to `parser.patch` ([#2246](https://github.com/hey-api/openapi-ts/pull/2246))

---

### @hey-api/openapi-ts 0.78.1

- Thanks @mrlubos! - fix(valibot): properly handle array minLength and maxLength ([#2275](https://github.com/hey-api/openapi-ts/pull/2275))
- Thanks @mrlubos! - fix(typescript): handle additionalProperties in propertyNames ([#2279](https://github.com/hey-api/openapi-ts/pull/2279))
- Thanks @mrlubos! - fix(clients): annotate serializer return types ([#2277](https://github.com/hey-api/openapi-ts/pull/2277))
- Thanks @mrlubos! - fix(zod): add `dates.offset` option ([#2280](https://github.com/hey-api/openapi-ts/pull/2280))

---

## 2025-06-25

### @hey-api/openapi-ts 0.77.0

- Thanks @mrlubos! - refactor(plugin): add `DefinePlugin` utility types ([#2227](https://github.com/hey-api/openapi-ts/pull/2227))
- Thanks @mrlubos! - feat(sdk): update `validator` option ([#2227](https://github.com/hey-api/openapi-ts/pull/2227))
- Thanks @mrlubos! - fix(client): add requestValidator option ([#2227](https://github.com/hey-api/openapi-ts/pull/2227))

---

## 2025-06-23

### @hey-api/openapi-ts 0.76.0

- Thanks @mrlubos! - feat(valibot): generate a single schema for requests ([#2226](https://github.com/hey-api/openapi-ts/pull/2226))
- Thanks @mrlubos! - fix(parser): prefer JSON media type ([#2221](https://github.com/hey-api/openapi-ts/pull/2221))
- Thanks @mrlubos! - fix(valibot): add `metadata` option to generate additional metadata for documentation, code generation, AI structured outputs, form validation, and other purposes ([#2226](https://github.com/hey-api/openapi-ts/pull/2226))

---

## 2025-06-22

### @hey-api/openapi-ts 0.75.0

- Thanks @mrlubos! - feat(parser): replace `plugin.subscribe` with `plugin.forEach` ([#2215](https://github.com/hey-api/openapi-ts/pull/2215))
- Thanks @mrlubos! - feat(tanstack-query): add name and case options ([#2218](https://github.com/hey-api/openapi-ts/pull/2218))
- `queryOptionsNameBuilder` renamed to `queryOptions`
- `infiniteQueryOptionsNameBuilder` renamed to `infiniteQueryOptions`
- `mutationOptionsNameBuilder` renamed to `mutationOptions`
- `queryKeyNameBuilder` renamed to `queryKeys`
- `infiniteQueryKeyNameBuilder` renamed to `infiniteQueryKeys`
- Thanks @mrlubos! - fix: make output pass stricter tsconfig configurations" ([#2219](https://github.com/hey-api/openapi-ts/pull/2219))
- Thanks @mrlubos! - fix(validators): handle additional properties object when no other properties are defined ([#2213](https://github.com/hey-api/openapi-ts/pull/2213))
- Thanks @mrlubos! - fix(parser): add `meta` and `version` options to input.patch ([#2216](https://github.com/hey-api/openapi-ts/pull/2216))
- Thanks @mrlubos! - fix(cli): correctly detect watch mode ([#2210](https://github.com/hey-api/openapi-ts/pull/2210))

---

## 2025-06-19

### @hey-api/openapi-ts 0.74.0

- Thanks @mrlubos! - feat(zod): generate a single schema for requests ([#2201](https://github.com/hey-api/openapi-ts/pull/2201))
- Thanks @Daschi1! - fix(valibot): use `isoTimestamp` instead of `isoDateTime` for date-time format ([#2192](https://github.com/hey-api/openapi-ts/pull/2192))
- Thanks @mrlubos! - fix(parser): do not mark schemas as duplicate if they have different format ([#2201](https://github.com/hey-api/openapi-ts/pull/2201))

---

## 2025-06-14

### @hey-api/openapi-ts 0.73.0

- Thanks @mrlubos! - feat: bundle `@hey-api/client-*` plugins ([#2172](https://github.com/hey-api/openapi-ts/pull/2172))
- Thanks @mrlubos! - fix: respect logs setting if initialization fails ([#2172](https://github.com/hey-api/openapi-ts/pull/2172))
- Thanks @mrlubos! - fix: export default pagination keywords ([#2170](https://github.com/hey-api/openapi-ts/pull/2170))

---

### @hey-api/nuxt 0.2.0

### Changed
- Thanks @mrlubos! - feat: remove `@hey-api/client-nuxt` dependency ([#2175](https://github.com/hey-api/openapi-ts/pull/2175))

---

## 2025-06-12

### @hey-api/openapi-ts 0.72.2

- Thanks @mrlubos! - fix(zod): add `metadata` option to generate additional metadata for documentation, code generation, AI structured outputs, form validation, and other purposes ([#2163](https://github.com/hey-api/openapi-ts/pull/2163))
- Thanks @mrlubos! - fix(tanstack-query): add name builder options for all generated artifacts ([#2167](https://github.com/hey-api/openapi-ts/pull/2167))
- Thanks @mrlubos! - fix(parser): filter orphans only when there are some operations ([#2166](https://github.com/hey-api/openapi-ts/pull/2166))
- Thanks @mrlubos! - fix(zod): support tuple types ([#2166](https://github.com/hey-api/openapi-ts/pull/2166))
- Thanks @mrlubos! - fix(parser): set correct subscription context for plugins ([#2167](https://github.com/hey-api/openapi-ts/pull/2167))

---

## 2025-06-11

### @hey-api/openapi-ts 0.72.1

- Thanks @Joshua-hypt! - fix(zod): handle array union types ([#2159](https://github.com/hey-api/openapi-ts/pull/2159))

---

## 2025-06-10

### @hey-api/openapi-ts 0.72.0

- Thanks @mrlubos! - feat(sdk): add `classStructure` option supporting dot or slash `operationId` notation when generating class-based SDKs ([#2141](https://github.com/hey-api/openapi-ts/pull/2141))
- Thanks @mrlubos! - fix: add crash report prompt ([#2151](https://github.com/hey-api/openapi-ts/pull/2151))
- Thanks @mrlubos! - fix(parser): handle `propertyNames` keyword ([#2153](https://github.com/hey-api/openapi-ts/pull/2153))
- Thanks @mrlubos! - fix(validators): correctly generate default value for `BigInt` ([#2152](https://github.com/hey-api/openapi-ts/pull/2152))
- Thanks @mrlubos! - fix(typescript): handle nested inline objects with write/read only fields ([#2151](https://github.com/hey-api/openapi-ts/pull/2151))

---

## 2025-06-06

### @hey-api/openapi-ts 0.71.1

- Thanks @mrlubos! - fix(parser): skip schema if it's an array or tuple and its items don't have any matching readable or writable scopes ([#2139](https://github.com/hey-api/openapi-ts/pull/2139))
- Thanks @mrlubos! - fix(parser): validate operationId keyword ([#2140](https://github.com/hey-api/openapi-ts/pull/2140))
- Thanks @mrlubos! - fix(parser): respect exportFromIndex option when using legacy clients ([#2137](https://github.com/hey-api/openapi-ts/pull/2137))

---

## 2025-06-05

### @hey-api/openapi-ts 0.71.0

- Thanks @mrlubos! - fix(sdk): rename `serviceNameBuilder` to `classNameBuilder` ([#2130](https://github.com/hey-api/openapi-ts/pull/2130))
- Thanks @johnny-mh! - feat(parser): allow patching specs with `input.patch` ([#2117](https://github.com/hey-api/openapi-ts/pull/2117))
- Thanks @mrlubos! - fix(typescript): better detect enum namespace ([#2132](https://github.com/hey-api/openapi-ts/pull/2132))
- Thanks @mrlubos! - feat(sdk): add `instance` option for instantiable SDKs ([#2130](https://github.com/hey-api/openapi-ts/pull/2130))

---

## 2025-06-04

### @hey-api/openapi-ts 0.70.0

- Thanks @mrlubos! - feat(sdk): add responseStyle option ([#2123](https://github.com/hey-api/openapi-ts/pull/2123))
- Thanks @mrlubos! - fix(typescript): ensure generated enum uses unique namespace to avoid conflicts with non-enum declarations ([#2116](https://github.com/hey-api/openapi-ts/pull/2116))
- Thanks @mrlubos! - fix(typescript): handle duplicate inline enum names ([#2116](https://github.com/hey-api/openapi-ts/pull/2116))

---

## 2025-06-02

### @hey-api/openapi-ts 0.69.2

- Thanks @mrlubos! - feat(parser): add validate_EXPERIMENTAL option ([#2110](https://github.com/hey-api/openapi-ts/pull/2110))
- Thanks @mrlubos! - fix(validators): do not wrap regular expression in slashes if the pattern is already wrapped ([#2114](https://github.com/hey-api/openapi-ts/pull/2114))
- Thanks @mrlubos! - fix(tanstack-query): create a shallow copy of queryKey in createInfiniteParams function ([#2115](https://github.com/hey-api/openapi-ts/pull/2115))

---

## 2025-05-30

### @hey-api/openapi-ts 0.69.1

- Thanks @mrlubos! - fix(valibot): use isoDate instead of date for date strings ([#2109](https://github.com/hey-api/openapi-ts/pull/2109))
- Thanks @mrlubos! - fix(typescript): generates union of arrays when items use nested oneOf ([#2108](https://github.com/hey-api/openapi-ts/pull/2108))
- Thanks @mrlubos! - fix(schema): nameBuilder can be a string ([#2106](https://github.com/hey-api/openapi-ts/pull/2106))
- Thanks @mrlubos! - fix(sdk): serviceNameBuilder can be a function ([#2106](https://github.com/hey-api/openapi-ts/pull/2106))

---

## 2025-05-29

### @hey-api/openapi-ts 0.69.0

- Thanks @mrlubos! - feat(sdk): use responses/errors map instead of union ([#2094](https://github.com/hey-api/openapi-ts/pull/2094))
- Thanks @mrlubos! - feat(validators): generate schemas for request parameters ([#2100](https://github.com/hey-api/openapi-ts/pull/2100))
- Thanks @mrlubos! - feat(validators): generate schemas for request bodies ([#2099](https://github.com/hey-api/openapi-ts/pull/2099))
- Thanks @mrlubos! - fix(sdk): skip spreading required headers when there are conflicting Content-Type headers ([#2097](https://github.com/hey-api/openapi-ts/pull/2097))
- Thanks @mrlubos! - fix(pagination): improved schema resolver for parameters ([#2096](https://github.com/hey-api/openapi-ts/pull/2096))

---

## 2025-05-28

### @hey-api/openapi-ts 0.68.0

- Thanks @mrlubos! - feat: upgraded input filters ([#2072](https://github.com/hey-api/openapi-ts/pull/2072))

---

### @hey-api/openapi-ts 0.68.1

- Thanks @mrlubos! - fix(parser): add back support for regular expressions in input filters ([#2086](https://github.com/hey-api/openapi-ts/pull/2086))
- Thanks @mrlubos! - fix(parser): extend input filters to handle reusable parameters and responses ([#2086](https://github.com/hey-api/openapi-ts/pull/2086))

---

## 2025-05-23

### @hey-api/nuxt 0.1.7

### Changed
- Updated dependencies []:

---

## 2025-05-19

### @hey-api/openapi-ts 0.67.5

- Thanks @mrlubos! - fix(tanstack-query): add SDK function comments to TanStack Query output ([#2052](https://github.com/hey-api/openapi-ts/pull/2052))
- Thanks @mrlubos! - fix(typescript): exclude $refs in readable/writable schemas when referenced schemas don't contain any readable/writable fields ([#2058](https://github.com/hey-api/openapi-ts/pull/2058))
- Thanks @mrlubos! - fix(typescript): add enumsConstantsIgnoreNull option to skip nulls from generated JavaScript objects ([#2059](https://github.com/hey-api/openapi-ts/pull/2059))

---

## 2025-05-14

### @hey-api/nuxt 0.1.6

### Changed
- Updated dependencies []:

---

## 2025-05-08

### @hey-api/openapi-ts 0.67.3

- Thanks @0xfurai! - fix: handle references to properties ([#2020](https://github.com/hey-api/openapi-ts/pull/2020))

---

## 2025-05-07

### @hey-api/openapi-ts 0.67.2

- Thanks @kennidenni! - fix: handle relative paths in client's `baseUrl` field ([#2023](https://github.com/hey-api/openapi-ts/pull/2023))

---

## 2025-05-04

### @hey-api/openapi-ts 0.67.0

- Thanks @mrlubos! - feat: respect `moduleResolution` value in `tsconfig.json` ([#2003](https://github.com/hey-api/openapi-ts/pull/2003))
- Thanks @Liooo! - fix: make discriminator field required when used with `oneOf` keyword ([#2006](https://github.com/hey-api/openapi-ts/pull/2006))
- Thanks @mrlubos! - fix: avoid including underscore for appended types (e.g. data, error, response) when preserving identifier case ([#2009](https://github.com/hey-api/openapi-ts/pull/2009))

---

### @hey-api/openapi-ts 0.67.1

- Thanks @mrlubos! - fix: do not use named imports from typescript module ([#2010](https://github.com/hey-api/openapi-ts/pull/2010))

---

## 2025-04-28

### @hey-api/openapi-ts 0.66.7

- Thanks @mrlubos! - fix: handle schemas with all write-only or read-only fields ([#1981](https://github.com/hey-api/openapi-ts/pull/1981))
- Thanks @mrlubos! - fix: avoid generating duplicate operation ids when sanitizing input ([#1990](https://github.com/hey-api/openapi-ts/pull/1990))
- Thanks @mrlubos! - fix: Zod schemas use .and instead of .merge ([#1991](https://github.com/hey-api/openapi-ts/pull/1991))
- Thanks @ngalluzzo! - fix: correctly handle numeric property names with signs ([#1919](https://github.com/hey-api/openapi-ts/pull/1919))
- Thanks @mrlubos! - fix: Zod plugin handles nullable enums ([#1984](https://github.com/hey-api/openapi-ts/pull/1984))
- Thanks @mrlubos! - fix: handle discriminator with multiple mappings to the same schema ([#1986](https://github.com/hey-api/openapi-ts/pull/1986))
- Thanks @mrlubos! - fix: Zod schemas with BigInt and min/max constraints ([#1980](https://github.com/hey-api/openapi-ts/pull/1980))
- Thanks @mrlubos! - fix: correct path to nested plugin files when using exportFromIndex ([#1987](https://github.com/hey-api/openapi-ts/pull/1987))
- Thanks @mrlubos! - fix: handle extended `$ref` with `type` keyword in OpenAPI 3.1 ([#1978](https://github.com/hey-api/openapi-ts/pull/1978))
- Thanks @mrlubos! - fix: handle additionalProperties empty object as unknown instead of preserving an empty interface ([#1982](https://github.com/hey-api/openapi-ts/pull/1982))

---

## 2025-04-23

### @hey-api/openapi-ts 0.66.6

- Thanks @mrlubos! - fix: handle Zod circular reference ([#1971](https://github.com/hey-api/openapi-ts/pull/1971))

---

## 2025-04-17

### @hey-api/openapi-ts 0.66.5

- Thanks @devNameAsyraf! - fix: don't use JSON serializer for `application/octet-stream` ([#1951](https://github.com/hey-api/openapi-ts/pull/1951))
- Thanks @sredni! - fix: repeat tuple type `maxItems` times ([#1938](https://github.com/hey-api/openapi-ts/pull/1938))

---

### @hey-api/nuxt 0.1.5

### Changed
- Thanks @a1mersnow! - fix: avoid duplicate definition of `@hey-api/client-nuxt` plugin ([#1939](https://github.com/hey-api/openapi-ts/pull/1939))
- Thanks @a1mersnow! - fix: skip watch mode in prepare step ([#1939](https://github.com/hey-api/openapi-ts/pull/1939))
- Updated dependencies []:

---

## 2025-04-04

### @hey-api/openapi-ts 0.66.3

- Thanks @Freddis! - fix: handle nullable dates in transformers ([#1917](https://github.com/hey-api/openapi-ts/pull/1917))

---

## 2025-04-03

### @hey-api/openapi-ts 0.66.2

- Thanks @BogdanMaier! - fix: prevent crash when optional pagination field is missing ([#1913](https://github.com/hey-api/openapi-ts/pull/1913))

---

## 2025-04-02

### @hey-api/openapi-ts 0.66.1

- Thanks @mrlubos! - fix: exclude and include expressions can be an array ([#1906](https://github.com/hey-api/openapi-ts/pull/1906))
- Thanks @mrlubos! - fix: support excluding deprecated fields with '@deprecated' ([#1906](https://github.com/hey-api/openapi-ts/pull/1906))

---

## 2025-04-01

### @hey-api/openapi-ts 0.66.0

- Thanks @mrlubos! - feat: support read-only and write-only properties ([#1896](https://github.com/hey-api/openapi-ts/pull/1896))

---

## 2025-03-31

### @hey-api/openapi-ts 0.65.0

- Thanks @mrlubos! - feat: support custom clients ([#1889](https://github.com/hey-api/openapi-ts/pull/1889))
- Thanks @mrlubos! - fix: allow passing fetch options to the request resolving a specification ([#1892](https://github.com/hey-api/openapi-ts/pull/1892))
- Thanks @Matsuuu! - feat: ability to disable writing a log file via a `--no-log-file` flag or `logs.file` = `false` ([#1877](https://github.com/hey-api/openapi-ts/pull/1877))

---

### @hey-api/nuxt 0.1.4

### Changed
- Updated dependencies []:

---

## 2025-03-26

### @hey-api/openapi-ts 0.64.14

- Thanks @john-cremit! - feat: allow customizing pagination keywords using `input.pagination.keywords` ([#1827](https://github.com/hey-api/openapi-ts/pull/1827))

---

### @hey-api/openapi-ts 0.64.15

- Thanks @kelnos! - feat: add support for cookies auth ([#1850](https://github.com/hey-api/openapi-ts/pull/1850))

---

### @hey-api/nuxt 0.1.3

### Changed
- Updated dependencies []:

---

## 2025-03-19

### @hey-api/vite-plugin 0.2.0

### Changed
- Thanks @mrlubos! - fix: initial release ([#1838](https://github.com/hey-api/openapi-ts/pull/1838))

---

## 2025-03-18

### @hey-api/openapi-ts 0.64.13

- Thanks @mrlubos! - fix: bump json-schema-ref-parser package ([#1822](https://github.com/hey-api/openapi-ts/pull/1822))
- Thanks @mrlubos! - fix: allow config to be a function ([#1826](https://github.com/hey-api/openapi-ts/pull/1826))

---

### @hey-api/nuxt 0.1.2

### Changed
- Thanks @mrlubos! - fix: move @hey-api/openapi-ts to peerDependencies ([#1825](https://github.com/hey-api/openapi-ts/pull/1825))
- Updated dependencies [, ]:

---

## 2025-03-13

### @hey-api/openapi-ts 0.64.12

- Thanks @shemsiu! - Allow `scheme` property to be case-insensitive ([#1816](https://github.com/hey-api/openapi-ts/pull/1816))

---

### @hey-api/nuxt 0.1.1

### Changed
- Updated dependencies []:

---

## 2025-03-12

### @hey-api/openapi-ts 0.64.11

- Thanks @mrlubos! - fix: support Hey API platform input arguments ([#1800](https://github.com/hey-api/openapi-ts/pull/1800))
- Thanks @mrlubos! - fix: handle raw OpenAPI specification input ([#1800](https://github.com/hey-api/openapi-ts/pull/1800))

---

### @hey-api/nuxt 0.1.0

### Changed
- Thanks @mrlubos! - feat: initial release ([#1800](https://github.com/hey-api/openapi-ts/pull/1800))
- Updated dependencies [, , ]:

---

## 2025-03-04

### @hey-api/openapi-ts 0.64.10

- Thanks @mrlubos! - fix: don't throw on missing performance marks ([#1779](https://github.com/hey-api/openapi-ts/pull/1779))
- Thanks @Schroedi! - fix: handle nested dates in transformers ([#1767](https://github.com/hey-api/openapi-ts/pull/1767))

---

## 2025-03-03

### @hey-api/openapi-ts 0.64.9

- Thanks @mrlubos! - docs: announce Hey API platform ([#1774](https://github.com/hey-api/openapi-ts/pull/1774))

---

## 2025-03-01

### @hey-api/openapi-ts 0.64.8

- Thanks @mrlubos! - fix: reduce minimum Node.js 22 version to 22.10.0 ([#1764](https://github.com/hey-api/openapi-ts/pull/1764))

---

## 2025-02-27

### @hey-api/openapi-ts 0.64.7

- Thanks @Matsuuu! - fix: Wrap the GET request in watch mode with try-catch to prevent crashes on no-head watch targets ([#1755](https://github.com/hey-api/openapi-ts/pull/1755))

---

## 2025-02-26

### @hey-api/openapi-ts 0.64.6

- Thanks @Matsuuu! - fix: Wrap HEAD request in a try-catch to prevent watch mode crashes on server reloads ([#1748](https://github.com/hey-api/openapi-ts/pull/1748))

---

## 2025-02-19

### @hey-api/openapi-ts 0.64.5

- Thanks @georgesmith46! - fix: correctly generate zod regex expressions when using patterns ([#1728](https://github.com/hey-api/openapi-ts/pull/1728))

---

## 2025-02-13

### @hey-api/openapi-ts 0.64.4

- Thanks @mrlubos! - fix: use relative path to custom config file if provided when resolving relative paths ([#1710](https://github.com/hey-api/openapi-ts/pull/1710))

---

## 2025-02-10

### @hey-api/openapi-ts 0.64.2

- Thanks @mrlubos! - fix: add exportFromIndex option to all plugins ([#1697](https://github.com/hey-api/openapi-ts/pull/1697))
- Thanks @mrlubos! - fix: allow passing arbitrary values to SDK functions via `meta` field ([#1699](https://github.com/hey-api/openapi-ts/pull/1699))
- Thanks @hunshcn! - sanitize "+" in uri to avoid plus in function name ([#1687](https://github.com/hey-api/openapi-ts/pull/1687))

---

### @hey-api/openapi-ts 0.64.3

- Thanks @mrlubos! - fix: correctly type default value for Nuxt client ([#1701](https://github.com/hey-api/openapi-ts/pull/1701))

---

## 2025-02-03

### @hey-api/openapi-ts 0.64.1

- Thanks @mrlubos! - fix: watch mode handles servers not exposing HEAD method for spec ([#1668](https://github.com/hey-api/openapi-ts/pull/1668))
- Thanks @mrlubos! - fix: add watch.timeout option ([#1668](https://github.com/hey-api/openapi-ts/pull/1668))

---

## 2025-02-02

### @hey-api/openapi-ts 0.64.0

- Thanks @mrlubos! - feat: added `client.baseUrl` option ([#1661](https://github.com/hey-api/openapi-ts/pull/1661))
- Thanks @mrlubos! - fix: make createConfig, CreateClientConfig, and Config accept ClientOptions generic ([#1661](https://github.com/hey-api/openapi-ts/pull/1661))

---

## 2025-01-30

### @hey-api/openapi-ts 0.63.1

- Thanks @mrlubos! - fix: update keywords in package.json ([#1637](https://github.com/hey-api/openapi-ts/pull/1637))
- Thanks @mrlubos! - fix: add Next.js client ([#1637](https://github.com/hey-api/openapi-ts/pull/1637))
- Thanks @mrlubos! - feat: support required client in SDK using sdk.client = false ([#1646](https://github.com/hey-api/openapi-ts/pull/1646))
- Thanks @mrlubos! - fix: add support for openIdConnect auth flow ([#1648](https://github.com/hey-api/openapi-ts/pull/1648))

---

### @hey-api/openapi-ts 0.63.2

- Thanks @mrlubos! - fix: lower Node version requirements ([#1651](https://github.com/hey-api/openapi-ts/pull/1651))

---

## 2025-01-27

### @hey-api/openapi-ts 0.63.0

- Thanks @mrlubos! - feat: move clients to plugins ([#1626](https://github.com/hey-api/openapi-ts/pull/1626))
- Thanks @mrlubos! - fix: move sdk.throwOnError option to client.throwOnError ([#1626](https://github.com/hey-api/openapi-ts/pull/1626))
- Thanks @mrlubos! - fix: sdks import client from client.gen.ts instead of defining it inside the file ([#1626](https://github.com/hey-api/openapi-ts/pull/1626))
- Thanks @mrlubos! - fix: throw if inferred plugin not found ([#1626](https://github.com/hey-api/openapi-ts/pull/1626))

---

## 2025-01-21

### @hey-api/openapi-ts 0.62.3

- Thanks @mrlubos! - fix: bundle clients from compiled index file ([#1600](https://github.com/hey-api/openapi-ts/pull/1600))
- Thanks @mrlubos! - fix: generate correct response for text/plain content type ([#1594](https://github.com/hey-api/openapi-ts/pull/1594))
- Thanks @mrlubos! - fix: do not use a body serializer on text/plain sdks ([#1596](https://github.com/hey-api/openapi-ts/pull/1596))
- Thanks @mrlubos! - fix: support all oauth2 flows in sdk auth ([#1602](https://github.com/hey-api/openapi-ts/pull/1602))
- Thanks @mrlubos! - fix: add null to valid bodySerializer types ([#1596](https://github.com/hey-api/openapi-ts/pull/1596))

---

## 2025-01-20

### @hey-api/openapi-ts 0.62.2

- Thanks @mrlubos! - fix: add support for Nuxt client ([#1519](https://github.com/hey-api/openapi-ts/pull/1519))

---

## 2025-01-15

### @hey-api/openapi-ts 0.62.1

- Thanks @mrlubos! - fix: generate bigint type instead of BigInt ([#1574](https://github.com/hey-api/openapi-ts/pull/1574))
- Thanks @mrlubos! - fix: add ability to skip generating index file with output.indexFile ([#1572](https://github.com/hey-api/openapi-ts/pull/1572))

---

## 2025-01-14

### @hey-api/openapi-ts 0.62.0

- Thanks @mrlubos! - feat: change the default parser ([#1568](https://github.com/hey-api/openapi-ts/pull/1568))
- Thanks @mrlubos! - fix: spread sdk options at the end to allow overriding generated values ([#1566](https://github.com/hey-api/openapi-ts/pull/1566))

---

## 2025-01-13

### @hey-api/openapi-ts 0.61.3

- Thanks @mrlubos! - fix: use z.coerce before calling z.bigint ([#1552](https://github.com/hey-api/openapi-ts/pull/1552))

---

## 2025-01-09

### @hey-api/openapi-ts 0.61.2

- Thanks @mrlubos! - fix: send GET request only on first spec fetch ([#1543](https://github.com/hey-api/openapi-ts/pull/1543))

---

## 2025-01-08

### @hey-api/openapi-ts 0.61.1

- Thanks @mrlubos! - fix: detect pagination in composite schemas with null type ([#1530](https://github.com/hey-api/openapi-ts/pull/1530))
- Thanks @mrlubos! - fix: handle primitive constants in Zod and types ([#1535](https://github.com/hey-api/openapi-ts/pull/1535))

---

## 2025-01-06

### @hey-api/openapi-ts 0.61.0

### ⚠️ Breaking
- **BREAKING**: please update `@hey-api/client-*` packages to the latest version

- Thanks @chriswiggins! - Add support for HTTP Bearer Authentication Scheme ([#1520](https://github.com/hey-api/openapi-ts/pull/1520))
- Thanks @mrlubos! - feat: add OpenAPI 2.0 support to experimental parser ([#1525](https://github.com/hey-api/openapi-ts/pull/1525))
- Thanks @mrlubos! - feat: add watch mode ([#1511](https://github.com/hey-api/openapi-ts/pull/1511))
- Thanks @mrlubos! - fix: add support for long integers ([#1529](https://github.com/hey-api/openapi-ts/pull/1529))
- Thanks @mrlubos! - fix: add `sdk.throwOnError` option ([#1512](https://github.com/hey-api/openapi-ts/pull/1512))
- Thanks @mrlubos! - fix: preserve leading separators in enum keys ([#1525](https://github.com/hey-api/openapi-ts/pull/1525))
- **BREAKING**: please update `@hey-api/client-*` packages to the latest version

---

## 2024-12-20

### @hey-api/openapi-ts 0.60.1

- Thanks @mrlubos! - fix: handle indexed access checks ([#1468](https://github.com/hey-api/openapi-ts/pull/1468))
- Thanks @mrlubos! - fix: zod: generate patterns and improve plain schemas ([#1469](https://github.com/hey-api/openapi-ts/pull/1469))
- Thanks @mrlubos! - fix: add links to the experimental parser callouts ([#1471](https://github.com/hey-api/openapi-ts/pull/1471))
- Thanks @mrlubos! - fix: update types for custom plugins so defineConfig does not throw ([#1462](https://github.com/hey-api/openapi-ts/pull/1462))
- Thanks @mrlubos! - fix: export IR types ([#1464](https://github.com/hey-api/openapi-ts/pull/1464))
- Thanks @mrlubos! - fix: export utils ([#1467](https://github.com/hey-api/openapi-ts/pull/1467))
- Thanks @mrlubos! - fix: allow plugins to explicitly declare whether they should be re-exported from the index file ([#1457](https://github.com/hey-api/openapi-ts/pull/1457))

---

## 2024-12-18

### @hey-api/openapi-ts 0.60.0

- Thanks @mrlubos! - fix: require sdk.transformer to use generated transformers ([#1430](https://github.com/hey-api/openapi-ts/pull/1430))
- Thanks @mrlubos! - fix: revert license to MIT ([#1447](https://github.com/hey-api/openapi-ts/pull/1447))
- Thanks @mrlubos! - feat: Zod plugin generates response schemas ([#1430](https://github.com/hey-api/openapi-ts/pull/1430))

---

## 2024-12-12

### @hey-api/openapi-ts 0.59.2

- Thanks @mrlubos! - fix: generate querySerializer options for Axios client ([#1420](https://github.com/hey-api/openapi-ts/pull/1420))
- Thanks @mrlubos! - fix: infer responseType in SDKs for axios client ([#1419](https://github.com/hey-api/openapi-ts/pull/1419))
- Thanks @mrlubos! - feat: support oauth2 and apiKey security schemes ([#1409](https://github.com/hey-api/openapi-ts/pull/1409))
- Thanks @mrlubos! - fix: zod plugin handles recursive schemas ([#1416](https://github.com/hey-api/openapi-ts/pull/1416))

---

## 2024-12-07

### @hey-api/openapi-ts 0.59.1

- Thanks @mrlubos! - fix: prefix restricted identifier names with underscore ([#1398](https://github.com/hey-api/openapi-ts/pull/1398))
- Thanks @mrlubos! - fix: disallow additional query parameters in experimental parser output ([#1394](https://github.com/hey-api/openapi-ts/pull/1394))

---

## 2024-12-05

### @hey-api/openapi-ts 0.59.0

- Thanks @mrlubos! - feat: add `logs.level` option ([#1387](https://github.com/hey-api/openapi-ts/pull/1387))
- Thanks @mrlubos! - feat: remove `@hey-api/schemas` from default plugins ([#1389](https://github.com/hey-api/openapi-ts/pull/1389))
- Thanks @mrlubos! - fix: correctly resolve required properties in nested allOf composition ([#1382](https://github.com/hey-api/openapi-ts/pull/1382))
- Thanks @mrlubos! - fix: add `--silent` or `-s` CLI option for silent log level ([#1387](https://github.com/hey-api/openapi-ts/pull/1387))
- Thanks @mrlubos! - fix: transformers handle allOf composition in experimental parser ([#1382](https://github.com/hey-api/openapi-ts/pull/1382))
- Thanks @mrlubos! - feat: add `logs` configuration option to customize log directory ([#1387](https://github.com/hey-api/openapi-ts/pull/1387))
- Thanks @mrlubos! - fix: allow arbitrary object properties when additionalProperties is undefined ([#1390](https://github.com/hey-api/openapi-ts/pull/1390))
- Thanks @mrlubos! - fix: support `DEBUG` environment variable ([#1387](https://github.com/hey-api/openapi-ts/pull/1387))

---

## 2024-12-02

### @hey-api/openapi-ts 0.58.0

- Thanks @mrlubos! - feat: add typescript.identifierCase option ([#1353](https://github.com/hey-api/openapi-ts/pull/1353))
- Thanks @mrlubos! - fix: remove schemas and transformers re-exports from index.ts ([#1360](https://github.com/hey-api/openapi-ts/pull/1360))
- Thanks @mrlubos! - feat: add output.clean option ([#1360](https://github.com/hey-api/openapi-ts/pull/1360))
- Thanks @mrlubos! - feat: add typescript.enumsCase option ([#1362](https://github.com/hey-api/openapi-ts/pull/1362))
- Thanks @mrlubos! - fix: add before and after to pagination keywords ([#1361](https://github.com/hey-api/openapi-ts/pull/1361))
- Thanks @mrlubos! - fix: export Plugin API namespace ([#1368](https://github.com/hey-api/openapi-ts/pull/1368))
- Thanks @mrlubos! - fix: TanStack Query plugin handles conflict with internal function name in experimental parser ([#1369](https://github.com/hey-api/openapi-ts/pull/1369))

---

## 2024-11-25

### @hey-api/openapi-ts 0.57.1

- Thanks @mrlubos! - fix: transformers correctly handle an array ([#1335](https://github.com/hey-api/openapi-ts/pull/1335))
- Thanks @mrlubos! - fix: improve camelcase with abbreviated plurals ([#1332](https://github.com/hey-api/openapi-ts/pull/1332))
- Thanks @mrlubos! - fix: experimental parser generates url inside data types ([#1333](https://github.com/hey-api/openapi-ts/pull/1333))
- Thanks @mrlubos! - fix: experimental parser transforms anyOf date and null ([#1336](https://github.com/hey-api/openapi-ts/pull/1336))
- Thanks @mrlubos! - fix: experimental parser handles empty string and null enum values in JavaScript mode ([#1330](https://github.com/hey-api/openapi-ts/pull/1330))
- Thanks @mrlubos! - fix: experimental parser exports reusable request bodies ([#1340](https://github.com/hey-api/openapi-ts/pull/1340))

---

## 2024-11-22

### @hey-api/openapi-ts 0.57.0

- Thanks @mrlubos! - feat: rename Hey API plugins ([#1324](https://github.com/hey-api/openapi-ts/pull/1324))
- Thanks @mrlubos! - feat: add typescript.exportInlineEnums option ([#1327](https://github.com/hey-api/openapi-ts/pull/1327))
- Thanks @mrlubos! - fix: improve generated enum keys in experimental parser ([#1326](https://github.com/hey-api/openapi-ts/pull/1326))

---

## 2024-11-21

### @hey-api/openapi-ts 0.56.2

- Thanks @mrlubos! - fix: add input.exclude option ([#1316](https://github.com/hey-api/openapi-ts/pull/1316))
- Thanks @mrlubos! - fix: make Zod plugin available in plugins options ([#1316](https://github.com/hey-api/openapi-ts/pull/1316))

---

### @hey-api/openapi-ts 0.56.3

- Thanks @mrlubos! - fix: Zod plugin handles value constraints and defaults ([#1319](https://github.com/hey-api/openapi-ts/pull/1319))

---

## 2024-11-19

### @hey-api/openapi-ts 0.56.1

- Thanks @mrlubos! - fix: gracefully handle invalid schema type in experimental parser ([#1309](https://github.com/hey-api/openapi-ts/pull/1309))

---

## 2024-11-18

### @hey-api/openapi-ts 0.56.0

- Thanks @jacobinu! - feat: add `fastify` plugin ([#1286](https://github.com/hey-api/openapi-ts/pull/1286))
- Thanks @jacobinu! - fix: export a map of error and response types by status code ([#1286](https://github.com/hey-api/openapi-ts/pull/1286))
- Thanks @jacobinu! - fix: deprecate types.tree option ([#1286](https://github.com/hey-api/openapi-ts/pull/1286))
- Thanks @mrlubos! - fix: handle file-like content media type without explicit schema ([#1305](https://github.com/hey-api/openapi-ts/pull/1305))

---

## 2024-11-14

### @hey-api/openapi-ts 0.55.3

- Thanks @hougesen! - feat: add support for oxlint as linter ([#1283](https://github.com/hey-api/openapi-ts/pull/1283))

---

## 2024-11-11

### @hey-api/openapi-ts 0.55.2

- Thanks @mrlubos! - fix: update sponsorship links ([#1253](https://github.com/hey-api/openapi-ts/pull/1253))
- Thanks @mrlubos! - fix: correctly generate array when items are a oneOf array with length 1 ([#1266](https://github.com/hey-api/openapi-ts/pull/1266))
- Thanks @mrlubos! - fix: handle non-exploded array query parameters ([#1265](https://github.com/hey-api/openapi-ts/pull/1265))
- Thanks @mrlubos! - fix: handle discriminators in experimental parser ([#1267](https://github.com/hey-api/openapi-ts/pull/1267))

---

## 2024-11-08

### @hey-api/openapi-ts 0.55.1

- Thanks @mrlubos! - fix: handle nullable enums in experimental parser ([#1248](https://github.com/hey-api/openapi-ts/pull/1248))
- Thanks @mrlubos! - fix: add support for custom plugins ([#1251](https://github.com/hey-api/openapi-ts/pull/1251))
- Thanks @mrlubos! - fix: render void for empty response status codes in experimental parser ([#1250](https://github.com/hey-api/openapi-ts/pull/1250))

---

## 2024-11-07

### @hey-api/openapi-ts 0.55.0

- Thanks @mrlubos! - feat: add input.include option ([#1241](https://github.com/hey-api/openapi-ts/pull/1241))
- Thanks @mrlubos! - fix: handle pagination with basic refs ([#1239](https://github.com/hey-api/openapi-ts/pull/1239))

---

## 2024-11-06

### @hey-api/openapi-ts 0.54.3

- Thanks @mrlubos! - feat: add OpenAPI 3.0.x experimental parser ([#1230](https://github.com/hey-api/openapi-ts/pull/1230))

---

### @hey-api/openapi-ts 0.54.4

- Thanks @mrlubos! - fix: forbid any body, path, or query parameters if not defined in spec ([#1237](https://github.com/hey-api/openapi-ts/pull/1237))
- Thanks @mrlubos! - fix: handle additionalProperties: boolean in experimental parser ([#1235](https://github.com/hey-api/openapi-ts/pull/1235))
- Thanks @mrlubos! - fix: update schemas plugin to handle experimental 3.0.x parser ([#1233](https://github.com/hey-api/openapi-ts/pull/1233))

---

## 2024-11-02

### @hey-api/openapi-ts 0.54.2

- Thanks @mrlubos! - feat: add support for @tanstack/angular-query-experimental package ([#1222](https://github.com/hey-api/openapi-ts/pull/1222))

---

## 2024-10-29

### @hey-api/openapi-ts 0.54.1

- Thanks @mrlubos! - fix: ignore name option when not used with legacy clients to avoid producing broken output ([#1211](https://github.com/hey-api/openapi-ts/pull/1211))
- Thanks @mrlubos! - fix: add support for OpenAPI 3.1.1 to experimental parser ([#1209](https://github.com/hey-api/openapi-ts/pull/1209))

---

## 2024-10-28

### @hey-api/openapi-ts 0.54.0

- Thanks @mrlubos! - feat: make plugins first-class citizens ([#1201](https://github.com/hey-api/openapi-ts/pull/1201))

---

## 2024-10-25

### @hey-api/openapi-ts 0.53.12

- Thanks @mrlubos! - fix: TanStack Query plugin using missing import for infinite query ([#1195](https://github.com/hey-api/openapi-ts/pull/1195))
- Thanks @mrlubos! - fix: pass TanStack query signal to client call ([#1194](https://github.com/hey-api/openapi-ts/pull/1194))

---

## 2024-10-14

### @hey-api/openapi-ts 0.53.11

- Thanks @mrlubos! - fix: update website domain, add license documentation ([#1151](https://github.com/hey-api/openapi-ts/pull/1151))

---

## 2024-10-12

### @hey-api/openapi-ts 0.53.10

- Thanks @mrlubos! - fix: update license field in package.json to match the license, revert client packages license to MIT ([#1145](https://github.com/hey-api/openapi-ts/pull/1145))

---

## 2024-10-10

### @hey-api/openapi-ts 0.53.9

- Thanks @BierDav! - Add support for passing mutation specific options to `<operation_id>Mutation(options)` ([#1137](https://github.com/hey-api/openapi-ts/pull/1137))

---

## 2024-10-07

### @hey-api/openapi-ts 0.53.8

- Thanks @mrlubos! - fix: use correct relative path to bundled client when imported from nested module ([#1123](https://github.com/hey-api/openapi-ts/pull/1123))

---

## 2024-10-03

### @hey-api/openapi-ts 0.53.7

- Thanks @mrlubos! - fix: skip nested properties in oneOf and anyOf compositions ([#1113](https://github.com/hey-api/openapi-ts/pull/1113))
- Thanks @mrlubos! - fix: abstract page params logic in TanStack Query plugin ([#1115](https://github.com/hey-api/openapi-ts/pull/1115))

---

## 2024-09-30

### @hey-api/openapi-ts 0.53.6

- Thanks @mrlubos! - fix: export spec-compliant OpenAPI 3.1 interface ([#1104](https://github.com/hey-api/openapi-ts/pull/1104))
- Thanks @mrlubos! - fix: handle multiple form-data parameters in Swagger 2.0 ([#1108](https://github.com/hey-api/openapi-ts/pull/1108))

---

## 2024-09-26

### @hey-api/openapi-ts 0.53.5

- Thanks @mrlubos! - fix: make TanStack Query plugin work with class-based services ([#1096](https://github.com/hey-api/openapi-ts/pull/1096))
- Thanks @mrlubos! - fix: avoid printing duplicate null nodes ([#1095](https://github.com/hey-api/openapi-ts/pull/1095))
- Thanks @mrlubos! - fix: attach TanStack Query infinite page params only if they exist ([#1094](https://github.com/hey-api/openapi-ts/pull/1094))

---

## 2024-09-25

### @hey-api/openapi-ts 0.53.4

- Thanks @mrlubos! - fix: import handlebars instead of runtime ([#1087](https://github.com/hey-api/openapi-ts/pull/1087))
- Thanks @mrlubos! - fix: support dynamic require in child_process ([#1086](https://github.com/hey-api/openapi-ts/pull/1086))

---

## 2024-09-22

### @hey-api/openapi-ts 0.53.3

- Thanks @mrlubos! - fix: properly handle dual publishing and type generation ([#1075](https://github.com/hey-api/openapi-ts/pull/1075))

---

## 2024-09-19

### @hey-api/openapi-ts 0.53.2

- Thanks @mrlubos! - fix: handle colon in operation path ([#1060](https://github.com/hey-api/openapi-ts/pull/1060))
- Thanks @mrlubos! - fix: allow overriding generated headers from options ([#1065](https://github.com/hey-api/openapi-ts/pull/1065))
- Thanks @mrlubos! - fix: export Operation interface ([#1068](https://github.com/hey-api/openapi-ts/pull/1068))
- Thanks @mrlubos! - fix: handle named object property with no nested properties ([#1067](https://github.com/hey-api/openapi-ts/pull/1067))
- Thanks @mrlubos! - fix: transform any-of nullable dates ([#1066](https://github.com/hey-api/openapi-ts/pull/1066))

---

## 2024-09-17

### @hey-api/openapi-ts 0.53.1

- Thanks @mrlubos! - fix: throw error on invalid client value ([#1050](https://github.com/hey-api/openapi-ts/pull/1050))

---

## 2024-09-04

### @hey-api/openapi-ts 0.53.0

- Thanks @mrlubos! - feat: rename legacy clients with 'legacy/' prefix ([#1008](https://github.com/hey-api/openapi-ts/pull/1008))
- Thanks @mrlubos! - feat: change schemas name pattern, add schemas.name option ([#1009](https://github.com/hey-api/openapi-ts/pull/1009))
- Thanks @jacobinu! - fix: make UserConfig interface instead of type ([#989](https://github.com/hey-api/openapi-ts/pull/989))
- Thanks @mrlubos! - fix: set query key base url from supplied client if provided ([#1010](https://github.com/hey-api/openapi-ts/pull/1010))

---

## 2024-08-27

### @hey-api/openapi-ts 0.52.11

- Thanks @mrlubos! - fix: export query key functions from TanStack Query plugin ([#981](https://github.com/hey-api/openapi-ts/pull/981))

---

## 2024-08-26

### @hey-api/openapi-ts 0.52.10

- Thanks @jacobinu! - fix: handle tree-shakeable angular client case ([#973](https://github.com/hey-api/openapi-ts/pull/973))

---

## 2024-08-18

### @hey-api/openapi-ts 0.52.9

- Thanks @mrlubos! - fix: handle schemas with generics from C# ([#948](https://github.com/hey-api/openapi-ts/pull/948))
- Thanks @mrlubos! - fix: rename infinite key in query key to \_infinite ([#949](https://github.com/hey-api/openapi-ts/pull/949))
- Thanks @mrlubos! - chore: warn on duplicate operation ID ([#946](https://github.com/hey-api/openapi-ts/pull/946))
- Thanks @mrlubos! - fix: correctly use parentheses around composed schemas ([#947](https://github.com/hey-api/openapi-ts/pull/947))
- Thanks @mrlubos! - fix: correctly handle integer type in additional properties ([#944](https://github.com/hey-api/openapi-ts/pull/944))

---

## 2024-08-14

### @hey-api/openapi-ts 0.52.7

- Thanks @mrlubos! - fix: handle various issues with additionalProperties definitions ([#929](https://github.com/hey-api/openapi-ts/pull/929))
- Thanks @mrlubos! - fix: update TanStack Query key to contain base URL ([#927](https://github.com/hey-api/openapi-ts/pull/927))
- Thanks @mrlubos! - fix: change TanStack Query mutation helpers to functions for consistent API ([#927](https://github.com/hey-api/openapi-ts/pull/927))

---

### @hey-api/openapi-ts 0.52.8

- Thanks @mrlubos! - fix: cherry pick keys in mutation page param type ([#932](https://github.com/hey-api/openapi-ts/pull/932))

---

## 2024-08-13

### @hey-api/openapi-ts 0.52.6

- Thanks @mrlubos! - fix: add preview version of TanStack Query plugin ([#920](https://github.com/hey-api/openapi-ts/pull/920))

---

## 2024-08-12

### @hey-api/openapi-ts 0.52.5

- Thanks @mrlubos! - fix: throw if prerequisite checks are not met ([#910](https://github.com/hey-api/openapi-ts/pull/910))
- Thanks @mrlubos! - fix: correctly transform string to pascalcase when referenced inside schema ([#907](https://github.com/hey-api/openapi-ts/pull/907))
- Thanks @mrlubos! - fix: do not generate types tree by default if services are enabled as it is unused ([#908](https://github.com/hey-api/openapi-ts/pull/908))

---

## 2024-08-10

### @hey-api/openapi-ts 0.52.4

- Thanks @mrlubos! - fix: define ThrowOnError generic as the last argument ([#895](https://github.com/hey-api/openapi-ts/pull/895))

---

## 2024-08-08

### @hey-api/openapi-ts 0.52.3

- Thanks @mrlubos! - fix: generate ThrowOnError generic for class-based client methods ([#884](https://github.com/hey-api/openapi-ts/pull/884))

---

## 2024-08-07

### @hey-api/openapi-ts 0.52.2

- Thanks @hougesen! - fix: check if key is schema property before removing ([#881](https://github.com/hey-api/openapi-ts/pull/881))

---

## 2024-08-06

### @hey-api/openapi-ts 0.52.1

- Thanks @mrlubos! - fix: define multiple errors type as union instead of intersection ([#855](https://github.com/hey-api/openapi-ts/pull/855))
- Thanks @mrlubos! - fix: remove Content-Type header with multipart/form-data content type ([#853](https://github.com/hey-api/openapi-ts/pull/853))
- Thanks @qqilihq! - fix: Additional properties key ([#861](https://github.com/hey-api/openapi-ts/pull/861))
- Thanks @SamuelGuillemet! - fix: add conditionnal generation for service related types ([#869](https://github.com/hey-api/openapi-ts/pull/869))

---

## 2024-08-01

### @hey-api/openapi-ts 0.52.0

- Thanks @LeeChSien! - feat: add namespace supporting for enums ([#835](https://github.com/hey-api/openapi-ts/pull/835))
- Thanks @mrlubos! - fix: generate internal client for services when using standalone package ([#830](https://github.com/hey-api/openapi-ts/pull/830))

---

## 2024-07-28

### @hey-api/openapi-ts 0.51.0

- Thanks @mrlubos! - feat: make `client` config option required ([#828](https://github.com/hey-api/openapi-ts/pull/828))
- Thanks @mrlubos! - fix: correctly process body parameter for OpenAPI 2.0 specs ([#823](https://github.com/hey-api/openapi-ts/pull/823))
- Thanks @mrlubos! - fix: do not ignore api-version param in standalone clients ([#827](https://github.com/hey-api/openapi-ts/pull/827))

---

## 2024-07-26

### @hey-api/openapi-ts 0.50.2

- Thanks @mrlubos! - fix: handle fully illegal schema names ([#818](https://github.com/hey-api/openapi-ts/pull/818))

---

## 2024-07-24

### @hey-api/openapi-ts 0.50.1

- Thanks @mrlubos! - fix: generate types only for filtered services ([#807](https://github.com/hey-api/openapi-ts/pull/807))
- Thanks @mrlubos! - fix: allow any key/value pair in object types with empty properties object ([#807](https://github.com/hey-api/openapi-ts/pull/807))

---

## 2024-07-21

### @hey-api/openapi-ts 0.50.0

- Thanks @mrlubos! - feat: allow bundling standalone clients with `client.bundle = true` ([#790](https://github.com/hey-api/openapi-ts/pull/790))

---

## 2024-07-17

### @hey-api/openapi-ts 0.49.0

- Thanks @mrlubos! - feat: allow filtering service endpoints with `services.filter` ([#787](https://github.com/hey-api/openapi-ts/pull/787))
- Thanks @mrlubos! - fix: suffix illegal service names ([#784](https://github.com/hey-api/openapi-ts/pull/784))
- Thanks @mrlubos! - fix: handle references to schemas with illegal names ([#786](https://github.com/hey-api/openapi-ts/pull/786))
- Thanks @mrlubos! - fix: handle application/x-www-form-urlencoded content in request body ([#788](https://github.com/hey-api/openapi-ts/pull/788))

---

## 2024-07-15

### @hey-api/openapi-ts 0.48.3

- Thanks @mrlubos! - fix: use methodNameBuilder when asClass is false ([#781](https://github.com/hey-api/openapi-ts/pull/781))
- Thanks @mrlubos! - fix: allow not generating types tree with types.tree = false ([#782](https://github.com/hey-api/openapi-ts/pull/782))

---

## 2024-07-04

### @hey-api/openapi-ts 0.48.2

- Thanks @mrlubos! - fix: handle formData parameters in generated types ([#746](https://github.com/hey-api/openapi-ts/pull/746))
- Thanks @mrlubos! - fix: ignore services.asClass setting for named clients ([#742](https://github.com/hey-api/openapi-ts/pull/742))
- Thanks @mrlubos! - fix: improve default response type detection ([#744](https://github.com/hey-api/openapi-ts/pull/744))
- Thanks @mrlubos! - fix: handle properties in one-of composition ([#745](https://github.com/hey-api/openapi-ts/pull/745))

---

## 2024-07-01

### @hey-api/openapi-ts 0.48.1

- Thanks @mrlubos! - fix: generate service types when types are enabled, even if services are disabled ([#734](https://github.com/hey-api/openapi-ts/pull/734))
- Thanks @mrlubos! - fix: support custom config file path ([#737](https://github.com/hey-api/openapi-ts/pull/737))
- Thanks @mrlubos! - fix: handle async response transformers ([#736](https://github.com/hey-api/openapi-ts/pull/736))

---

## 2024-06-24

### @hey-api/openapi-ts 0.48.0

- Thanks @anchan828! - feat: pass the Operation object to methodNameBuilder ([#696](https://github.com/hey-api/openapi-ts/pull/696))
- Thanks @mrlubos! - fix: make getHeaders accept generic ([#708](https://github.com/hey-api/openapi-ts/pull/708))
- Thanks @mrlubos! - fix: handle void responses in transformers ([#712](https://github.com/hey-api/openapi-ts/pull/712))

---

## 2024-06-21

### @hey-api/openapi-ts 0.47.2

- Thanks @mrlubos! - feat: add initial implementation of prefixItems ([#701](https://github.com/hey-api/openapi-ts/pull/701))

---

## 2024-06-19

### @hey-api/openapi-ts 0.47.1

- Thanks @Nick-Lucas! - Fix an issue where transforms for endpoints with array returns were not generated correctly ([#690](https://github.com/hey-api/openapi-ts/pull/690))

---

## 2024-06-16

### @hey-api/openapi-ts 0.47.0

- Thanks @mrlubos! - feat: add initial support for response transformers (string -> Date) ([#685](https://github.com/hey-api/openapi-ts/pull/685))
- Thanks @Stono! - Add support for customizing method names with `services.methodNameBuilder` ([#663](https://github.com/hey-api/openapi-ts/pull/663))

---

## 2024-05-27

### @hey-api/openapi-ts 0.46.3

- Thanks @SimenB! - Add explicit type annotations to `Interceptors` ([#594](https://github.com/hey-api/openapi-ts/pull/594))
- Thanks @mrlubos! - fix: handle 1XX response status codes ([#635](https://github.com/hey-api/openapi-ts/pull/635))
- Thanks @mrlubos! - fix: improve default response status code classification ([#636](https://github.com/hey-api/openapi-ts/pull/636))

---

## 2024-05-24

### @hey-api/openapi-ts 0.46.2

- do not transform property names for standalone clients ([#616](https://github.com/hey-api/openapi-ts/pull/616))

---

## 2024-05-23

### @hey-api/openapi-ts 0.46.1

- handle application/json content type in parameter definitions ([#614](https://github.com/hey-api/openapi-ts/pull/614))

---

## 2024-05-21

### @hey-api/openapi-ts 0.46.0

- feat: tree-shakeable services ([#602](https://github.com/hey-api/openapi-ts/pull/602))

---

## 2024-05-16

### @hey-api/openapi-ts 0.45.1

- use generated types in request object instead of inlined duplicated params ([#582](https://github.com/hey-api/openapi-ts/pull/582))

---

## 2024-05-15

### @hey-api/openapi-ts 0.45.0

- feat: remove client inference ([#569](https://github.com/hey-api/openapi-ts/pull/569))
- deduplicate inlined enums ([#573](https://github.com/hey-api/openapi-ts/pull/573))
- generate correct optional key in types when using positional arguments (useOptions: false) ([#572](https://github.com/hey-api/openapi-ts/pull/572))

---

## 2024-05-13

### @hey-api/openapi-ts 0.44.0

- feat: move format and lint config options to output object ([#546](https://github.com/hey-api/openapi-ts/pull/546))
- comment position in JavaScript enums ([#544](https://github.com/hey-api/openapi-ts/pull/544))
- export inlined enums from components ([#563](https://github.com/hey-api/openapi-ts/pull/563))
- remove unused enums option from CLI ([#565](https://github.com/hey-api/openapi-ts/pull/565))
- Support typescript in peerDependencies ([#551](https://github.com/hey-api/openapi-ts/pull/551))

---

## 2024-05-06

### @hey-api/openapi-ts 0.43.2

- deduplicate exported data and response types ([#538](https://github.com/hey-api/openapi-ts/pull/538))

---

## 2024-05-05

### @hey-api/openapi-ts 0.43.1

- use optional chaining in bin catch block ([#528](https://github.com/hey-api/openapi-ts/pull/528))
- broken encoding ([#532](https://github.com/hey-api/openapi-ts/pull/532))
- fix(parser): handle type array ([#533](https://github.com/hey-api/openapi-ts/pull/533))

---

## 2024-05-02

### @hey-api/openapi-ts 0.43.0

- feat: remove enum postfix, use typescript enums in types when generated, export enums from types.gen.ts ([#498](https://github.com/hey-api/openapi-ts/pull/498))
- negative numbers in numeric enums ([#470](https://github.com/hey-api/openapi-ts/pull/470))
- escape keys in schemas starting with digit but containing non-digit characters ([#502](https://github.com/hey-api/openapi-ts/pull/502))
- issue causing code to not generate (t.filter is not a function) ([#507](https://github.com/hey-api/openapi-ts/pull/507))
- handle additional properties union ([#499](https://github.com/hey-api/openapi-ts/pull/499))
- do not export inline enums ([#508](https://github.com/hey-api/openapi-ts/pull/508))
- prefix parameter type exports to avoid conflicts ([#501](https://github.com/hey-api/openapi-ts/pull/501))
- export operation data and response types ([#500](https://github.com/hey-api/openapi-ts/pull/500))
- handle cases where packages are installed globally ([#471](https://github.com/hey-api/openapi-ts/pull/471))
- handle cases where package.json does not exist ([#471](https://github.com/hey-api/openapi-ts/pull/471))

---

## 2024-04-22

### @hey-api/openapi-ts 0.42.1

- properly set formData and body when using options ([#461](https://github.com/hey-api/openapi-ts/pull/461))

---

## 2024-04-21

### @hey-api/openapi-ts 0.42.0

- feat: add support for biomejs as a formatter ([#455](https://github.com/hey-api/openapi-ts/pull/455))
- feat: move operationId config option to services object ([#441](https://github.com/hey-api/openapi-ts/pull/441))
- feat: add operation error type mappings ([#442](https://github.com/hey-api/openapi-ts/pull/442))
- feat: add support for biomejs as a linter ([#455](https://github.com/hey-api/openapi-ts/pull/455))
- feat: automatically handle dates in query string ([#443](https://github.com/hey-api/openapi-ts/pull/443))
- do not destructure data when using use options ([#450](https://github.com/hey-api/openapi-ts/pull/450))
- only remove core directory when export core is true ([#449](https://github.com/hey-api/openapi-ts/pull/449))
- add jsdoc comments with use options ([#439](https://github.com/hey-api/openapi-ts/pull/439))
- change: config option `lint: true` has changed to `lint: 'eslint'` ([#455](https://github.com/hey-api/openapi-ts/pull/455))
- change: disable formatting with prettier by default ([#457](https://github.com/hey-api/openapi-ts/pull/457))
- change: config option `format: true` has changed to `format: 'prettier'` ([#455](https://github.com/hey-api/openapi-ts/pull/455))

---

## 2024-04-19

### @hey-api/openapi-ts 0.41.0

- feat: add form type option for schemas ([#433](https://github.com/hey-api/openapi-ts/pull/433))
- feat: replace useDateType with option in types object ([#435](https://github.com/hey-api/openapi-ts/pull/435))
- feat: replace serviceResponse with option in services object ([#434](https://github.com/hey-api/openapi-ts/pull/434))
- feat: replace postfixServices with configuration object ([#430](https://github.com/hey-api/openapi-ts/pull/430))
- properly escape backticks in template literals ([#431](https://github.com/hey-api/openapi-ts/pull/431))
- transform names of referenced types ([#422](https://github.com/hey-api/openapi-ts/pull/422))
- use config interceptors passed to constructor when using named client ([#432](https://github.com/hey-api/openapi-ts/pull/432))
- properly escape expressions in template literals ([#431](https://github.com/hey-api/openapi-ts/pull/431))
- do not export common properties as schemas ([#424](https://github.com/hey-api/openapi-ts/pull/424))

---

## 2024-04-18

### @hey-api/openapi-ts 0.40.1

- revert to generating commonjs for esm and commonjs support ([#409](https://github.com/hey-api/openapi-ts/pull/409))

---

### @hey-api/openapi-ts 0.40.2

- unhandled SyntaxKind unknown when specification has numeric enums ([#417](https://github.com/hey-api/openapi-ts/pull/417))

---

## 2024-04-17

### @hey-api/openapi-ts 0.40.0

- feat: allow choosing naming convention for types ([#402](https://github.com/hey-api/openapi-ts/pull/402))
- rename exportModels to types ([#402](https://github.com/hey-api/openapi-ts/pull/402))
- rename models.gen.ts to types.gen.ts ([#399](https://github.com/hey-api/openapi-ts/pull/399))
- export enums from index.ts ([#399](https://github.com/hey-api/openapi-ts/pull/399))

---

## 2024-04-16

### @hey-api/openapi-ts 0.39.0

- feat: rename generated files ([#363](https://github.com/hey-api/openapi-ts/pull/363))
- feat: add JSON-LD to content parsing ([#390](https://github.com/hey-api/openapi-ts/pull/390))
- generate enums into their own file ([#358](https://github.com/hey-api/openapi-ts/pull/358))
- remove file if no contents to write to it ([#373](https://github.com/hey-api/openapi-ts/pull/373))
- eslint properly fixes output ([#375](https://github.com/hey-api/openapi-ts/pull/375))
- invalid typescript Record generated with circular dependencies ([#374](https://github.com/hey-api/openapi-ts/pull/374))
- prefer unknown type over any ([#392](https://github.com/hey-api/openapi-ts/pull/392))
- only delete generated files instead of whole output directory ([#362](https://github.com/hey-api/openapi-ts/pull/362))
- handle decoding models with `%` in description ([#360](https://github.com/hey-api/openapi-ts/pull/360))
- throw error when typescript is missing ([#366](https://github.com/hey-api/openapi-ts/pull/366))

---

## 2024-04-11

### @hey-api/openapi-ts 0.38.0

- rename write to dryRun and invert value ([#326](https://github.com/hey-api/openapi-ts/pull/326))
- generate constant size array types properly ([#345](https://github.com/hey-api/openapi-ts/pull/345))
- support x-enumNames for custom enum names ([#334](https://github.com/hey-api/openapi-ts/pull/334))
- export service types from single namespace ([#341](https://github.com/hey-api/openapi-ts/pull/341))
- generate models with proper indentation when formatting is false ([#340](https://github.com/hey-api/openapi-ts/pull/340))
- log errors to file ([#329](https://github.com/hey-api/openapi-ts/pull/329))
- cleanup some styling issues when generating client without formatting ([#330](https://github.com/hey-api/openapi-ts/pull/330))

---

### @hey-api/openapi-ts 0.38.1

- inconsistent indentation in models file when not using `format: true` ([#349](https://github.com/hey-api/openapi-ts/pull/349))
- output path no longer required to be within cwd ([#353](https://github.com/hey-api/openapi-ts/pull/353))

---

## 2024-04-09

### @hey-api/openapi-ts 0.36.1

- do not throw when failing to decode URI ([#296](https://github.com/hey-api/openapi-ts/pull/296))

---

### @hey-api/openapi-ts 0.36.2

- move service types into models file ([#292](https://github.com/hey-api/openapi-ts/pull/292))

---

### @hey-api/openapi-ts 0.37.0

- escape dollar sign in operation names ([#307](https://github.com/hey-api/openapi-ts/pull/307))
- remove: `generics` as valid option for serviceResponse ([#299](https://github.com/hey-api/openapi-ts/pull/299))

---

### @hey-api/openapi-ts 0.37.1

- ensure strings with both single/double quotes and backticks are escaped properly ([#310](https://github.com/hey-api/openapi-ts/pull/310))

---

### @hey-api/openapi-ts 0.37.2

- escape schema names ([#317](https://github.com/hey-api/openapi-ts/pull/317))
- escape backticks in strings starting with backtick ([#315](https://github.com/hey-api/openapi-ts/pull/315))

---

### @hey-api/openapi-ts 0.37.3

- do not ignore additionalProperties when object with properties object ([#323](https://github.com/hey-api/openapi-ts/pull/323))

---

## 2024-04-08

### @hey-api/openapi-ts 0.35.0

- fix(config): remove postfixModels option ([#266](https://github.com/hey-api/openapi-ts/pull/266))
- fix(client): do not send default params ([#267](https://github.com/hey-api/openapi-ts/pull/267))
- fix(api): use TypeScript Compiler API to create schemas ([#271](https://github.com/hey-api/openapi-ts/pull/271))
- fix(client): export APIResult when using serviceResponse as 'response' ([#283](https://github.com/hey-api/openapi-ts/pull/283))
- fix(parser): use only isRequired to determine if field is required ([#264](https://github.com/hey-api/openapi-ts/pull/264))

---

### @hey-api/openapi-ts 0.36.0

- feat: export schemas directly from OpenAPI specification (ie. support exporting JSON schemas draft 2020-12 ([#285](https://github.com/hey-api/openapi-ts/pull/285))
- fix(config): rename exportSchemas to schemas ([#288](https://github.com/hey-api/openapi-ts/pull/288))

---

## 2024-04-04

### @hey-api/openapi-ts 0.34.2

- fix(config): support ts config files and `defineConfig` syntax
- docs(readme): update broken contributing link ([#236](https://github.com/hey-api/openapi-ts/pull/236))

---

### @hey-api/openapi-ts 0.34.3

- fix(docs): link to docs hosted on vercel ([#244](https://github.com/hey-api/openapi-ts/pull/244))

---

### @hey-api/openapi-ts 0.34.4

- fix(client): namespace service data types ([#246](https://github.com/hey-api/openapi-ts/pull/246))

---

### @hey-api/openapi-ts 0.34.5

- fix(client): access service data type in namespace properly ([#258](https://github.com/hey-api/openapi-ts/pull/258))

---

## 2024-04-03

### @hey-api/openapi-ts 0.34.0

- feat(client): generate all services in single `services.ts` file ([#215](https://github.com/hey-api/openapi-ts/pull/215))
- feat(schema): add support for default values ([#197](https://github.com/hey-api/openapi-ts/pull/197))
- feat(schema): add array of enum values for enums ([#197](https://github.com/hey-api/openapi-ts/pull/197))
- fix(axios): use builtin form data to ensure blob form data works in node environment ([#211](https://github.com/hey-api/openapi-ts/pull/211))
- fix(enum): append index number on duplicate name ([#220](https://github.com/hey-api/openapi-ts/pull/220))

---

### @hey-api/openapi-ts 0.34.1

- fix(docs): ensure README is shown on NPMJS ([#229](https://github.com/hey-api/openapi-ts/pull/229))

---