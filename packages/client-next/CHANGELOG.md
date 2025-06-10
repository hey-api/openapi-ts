# @hey-api/client-next

## 0.5.0

### Minor Changes

- [#2148](https://github.com/hey-api/openapi-ts/pull/2148) [`10d2e03`](https://github.com/hey-api/openapi-ts/commit/10d2e03b8295e4e887fab8d023aa823699efbae8) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: export `buildClientParams` function

## 0.4.0

### Minor Changes

- [#2094](https://github.com/hey-api/openapi-ts/pull/2094) [`8152aaf`](https://github.com/hey-api/openapi-ts/commit/8152aaf4892c48b79fd3dc486eb3c0ea333dc3e6) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: accept responses/errors map instead of union

  **BREAKING**: Update `@hey-api/openapi-ts` to the latest version.

## 0.3.2

### Patch Changes

- [#2029](https://github.com/hey-api/openapi-ts/pull/2029) [`1f99066`](https://github.com/hey-api/openapi-ts/commit/1f99066efbb2d0e6b9e3710c701293c2cc09d65e) Thanks [@henry-encord](https://github.com/henry-encord)! - feat: support referencing interceptors by index

## 0.3.1

### Patch Changes

- [#2039](https://github.com/hey-api/openapi-ts/pull/2039) [`565e0b8`](https://github.com/hey-api/openapi-ts/commit/565e0b89fbab4556ecdc63dfe08250942681140e) Thanks [@Le0Developer](https://github.com/Le0Developer)! - fix(clients): fix query string encoding with empty lists/objects

## 0.3.0

### Minor Changes

- [#1889](https://github.com/hey-api/openapi-ts/pull/1889) [`67c385b`](https://github.com/hey-api/openapi-ts/commit/67c385bf6289a79726b0cdd85fd81ca501cf2248) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add @hey-api/openapi-ts to peer dependencies

## 0.2.4

### Patch Changes

- [#1850](https://github.com/hey-api/openapi-ts/pull/1850) [`fe43b88`](https://github.com/hey-api/openapi-ts/commit/fe43b889c20a2001f56e259f93f64851a1caa1d1) Thanks [@kelnos](https://github.com/kelnos)! - feat: add support for cookies auth

## 0.2.3

### Patch Changes

- [#1774](https://github.com/hey-api/openapi-ts/pull/1774) [`c0b36b9`](https://github.com/hey-api/openapi-ts/commit/c0b36b95645d484034c3af145c5554867568979b) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: announce Hey API platform

## 0.2.2

### Patch Changes

- [#1753](https://github.com/hey-api/openapi-ts/pull/1753) [`b8cc9f8`](https://github.com/hey-api/openapi-ts/commit/b8cc9f8a5eaf4f4ff345abc49c14c6b96744c2ea) Thanks [@LinuCC](https://github.com/LinuCC)! - fix: dropping Content-Type header with falsey but valid json body

## 0.2.1

### Patch Changes

- [#1674](https://github.com/hey-api/openapi-ts/pull/1674) [`7f0f4a7`](https://github.com/hey-api/openapi-ts/commit/7f0f4a76b06c8fafb33581b522faf8efc6fd85ac) Thanks [@ale18V](https://github.com/ale18V)! - Return a string from urlSearchParamsBodySerializer instead of a URLSearchParams object.
  This is due to some runtimes not being able to handle the URLSearchParams object as fetch body.

## 0.2.0

### Minor Changes

- [#1661](https://github.com/hey-api/openapi-ts/pull/1661) [`bb6d46a`](https://github.com/hey-api/openapi-ts/commit/bb6d46ae119ce4e7e3a2ab3fded74ac4fb4cdff2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: make createConfig, CreateClientConfig, and Config accept ClientOptions generic

  ### Added `ClientOptions` interface

  The `Config` interface now accepts an optional generic extending `ClientOptions` instead of `boolean` type `ThrowOnError`.

  ```ts
  type Foo = Config<false>; // [!code --]
  type Foo = Config<{ throwOnError: false }>; // [!code ++]
  ```

## 0.1.0

### Minor Changes

- [#1637](https://github.com/hey-api/openapi-ts/pull/1637) [`2dc380e`](https://github.com/hey-api/openapi-ts/commit/2dc380eabc17c723654beb04ecd7bce6d33d3b49) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: initial release
