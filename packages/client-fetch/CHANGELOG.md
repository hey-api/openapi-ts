# @hey-api/client-fetch

## 0.2.4

### Patch Changes

- [#899](https://github.com/hey-api/openapi-ts/pull/899) [`a8c84c0`](https://github.com/hey-api/openapi-ts/commit/a8c84c02dbb5ef1a59f5d414dff425e135c7a446) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: preserve key name in Date transformation

- [#901](https://github.com/hey-api/openapi-ts/pull/901) [`7825a2f`](https://github.com/hey-api/openapi-ts/commit/7825a2fba566a76c63775172ef0569ef375406b6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export more types to resolve TypeScript errors

## 0.2.3

### Patch Changes

- [#895](https://github.com/hey-api/openapi-ts/pull/895) [`44de8d8`](https://github.com/hey-api/openapi-ts/commit/44de8d89556b3abf48acc4e23c9b9c198059c757) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: define ThrowOnError generic as the last argument

## 0.2.2

### Patch Changes

- [#877](https://github.com/hey-api/openapi-ts/pull/877) [`72e2c4f`](https://github.com/hey-api/openapi-ts/commit/72e2c4fd7d07e532a848078c034bf33b6558ad3c) Thanks [@qqilihq](https://github.com/qqilihq)! - Relax JSON content type check so that e.g. `application/json; charset=utf-8` is properly detected

## 0.2.1

### Patch Changes

- [#864](https://github.com/hey-api/openapi-ts/pull/864) [`ec6bfc8`](https://github.com/hey-api/openapi-ts/commit/ec6bfc8292cce7663dfc6e0fcd89b44c56f08bb4) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: infer response shape based on throwOnError option value

- [#852](https://github.com/hey-api/openapi-ts/pull/852) [`93e2d11`](https://github.com/hey-api/openapi-ts/commit/93e2d11d2a8ddd1f78dde46eceeb5543cae07e36) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: process application types except for application/json as blobs

- [#873](https://github.com/hey-api/openapi-ts/pull/873) [`a73da1c`](https://github.com/hey-api/openapi-ts/commit/a73da1c854503246b6c58f1abea5dd77727eedca) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export RequestOptionsBase interface

- [#863](https://github.com/hey-api/openapi-ts/pull/863) [`da92c53`](https://github.com/hey-api/openapi-ts/commit/da92c535c14e3217d565472fe65c687243bc0dd8) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: cast query params dates into ISO strings

## 0.2.0

### Minor Changes

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`babf11a`](https://github.com/hey-api/openapi-ts/commit/babf11ae082af642ac71cfee9c523cc976132a50) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: remove default client export (see migration docs)

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`babf11a`](https://github.com/hey-api/openapi-ts/commit/babf11ae082af642ac71cfee9c523cc976132a50) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add `setConfig()` method

## 0.1.14

### Patch Changes

- [#845](https://github.com/hey-api/openapi-ts/pull/845) [`8c9c874`](https://github.com/hey-api/openapi-ts/commit/8c9c8749594622283eed2c37bddfa0f1b8cf23a4) Thanks [@julianklumpers](https://github.com/julianklumpers)! - Expose Config interface to consumers for Typescript augmentation

## 0.1.13

### Patch Changes

- [#842](https://github.com/hey-api/openapi-ts/pull/842) [`8e3c634`](https://github.com/hey-api/openapi-ts/commit/8e3c6343672b9280365c3266f94e4acba533bf29) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly set default parseAs value to "auto"

## 0.1.12

### Patch Changes

- [#816](https://github.com/hey-api/openapi-ts/pull/816) [`0c4ee06`](https://github.com/hey-api/openapi-ts/commit/0c4ee06548f177ce83d73802471c659834c63566) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: remove Content-Type header when there's no request body

## 0.1.11

### Patch Changes

- [#613](https://github.com/hey-api/openapi-ts/pull/613) [`c0ee1e3`](https://github.com/hey-api/openapi-ts/commit/c0ee1e3b56d67ab922491c488233bd89c8902986) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: use opts to get responseTransformer instead of options

## 0.1.10

### Patch Changes

- [#788](https://github.com/hey-api/openapi-ts/pull/788) [`ecd94f2`](https://github.com/hey-api/openapi-ts/commit/ecd94f2adab1dbe10e7a9c310d1fb6d1f170d332) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle application/x-www-form-urlencoded content in request body

## 0.1.9

### Patch Changes

- [#779](https://github.com/hey-api/openapi-ts/pull/779) [`e7e98d2`](https://github.com/hey-api/openapi-ts/commit/e7e98d279fe0ee4c71ae72a7b57afdd517a89641) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: always use client options when passed to service

## 0.1.8

### Patch Changes

- [#756](https://github.com/hey-api/openapi-ts/pull/756) [`d546a3f`](https://github.com/hey-api/openapi-ts/commit/d546a3f9fd0a6ff5181deb50ed467acd75370889) Thanks [@jumika](https://github.com/jumika)! - fix: allow number as body type

## 0.1.7

### Patch Changes

- [#736](https://github.com/hey-api/openapi-ts/pull/736) [`8410046`](https://github.com/hey-api/openapi-ts/commit/8410046c45d25db48ba940a0c6c7a7cda9e86b6a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle async response transformers

## 0.1.6

### Patch Changes

- [#700](https://github.com/hey-api/openapi-ts/pull/700) [`aa661a1`](https://github.com/hey-api/openapi-ts/commit/aa661a136d1174eadf4d11538e473b0d96b91b81) Thanks [@lsdch](https://github.com/lsdch)! - export RequestResult type

## 0.1.5

### Patch Changes

- [#698](https://github.com/hey-api/openapi-ts/pull/698) [`fc2b166`](https://github.com/hey-api/openapi-ts/commit/fc2b166c8f683ece948284cf7a629fcd5b096b40) Thanks [@lsdch](https://github.com/lsdch)! - export RequestResult type

## 0.1.4

### Patch Changes

- [#674](https://github.com/hey-api/openapi-ts/pull/674) [`da31b74`](https://github.com/hey-api/openapi-ts/commit/da31b7424b30e00233df5a3867022832c4981312) Thanks [@mlankamp](https://github.com/mlankamp)! - fix: allow non-object array in body

- [#682](https://github.com/hey-api/openapi-ts/pull/682) [`34980a4`](https://github.com/hey-api/openapi-ts/commit/34980a4dc8269c9256d65984ff29270851689c43) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: stronger types for result shape

- [#682](https://github.com/hey-api/openapi-ts/pull/682) [`34980a4`](https://github.com/hey-api/openapi-ts/commit/34980a4dc8269c9256d65984ff29270851689c43) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: generate correct error types

## 0.1.3

### Patch Changes

- [#639](https://github.com/hey-api/openapi-ts/pull/639) [`820002f`](https://github.com/hey-api/openapi-ts/commit/820002ffe687b01c7a9b2250e19ddbafd1aaed71) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: do not widen body type on optional prop

## 0.1.2

### Patch Changes

- fix: JSON stringify object headers ([#616](https://github.com/hey-api/openapi-ts/pull/616))

## 0.1.1

### Patch Changes

- fix: export Client interface ([#610](https://github.com/hey-api/openapi-ts/pull/610))

## 0.1.0

### Minor Changes

- feat: initial release ([#602](https://github.com/hey-api/openapi-ts/pull/602))
