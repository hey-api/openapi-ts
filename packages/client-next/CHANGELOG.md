# @hey-api/client-next

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
