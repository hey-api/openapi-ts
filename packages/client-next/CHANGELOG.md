# @hey-api/client-next

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
