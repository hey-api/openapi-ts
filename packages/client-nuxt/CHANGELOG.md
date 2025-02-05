# @hey-api/client-nuxt

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

## 0.1.3

### Patch Changes

- [#1637](https://github.com/hey-api/openapi-ts/pull/1637) [`2dc380e`](https://github.com/hey-api/openapi-ts/commit/2dc380eabc17c723654beb04ecd7bce6d33d3b49) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update keywords in package.json

- [#1649](https://github.com/hey-api/openapi-ts/pull/1649) [`603541e`](https://github.com/hey-api/openapi-ts/commit/603541e307dc2953da7dddd300176865629b50bb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: do not run validator and transformer when response is not ok

- [#1649](https://github.com/hey-api/openapi-ts/pull/1649) [`603541e`](https://github.com/hey-api/openapi-ts/commit/603541e307dc2953da7dddd300176865629b50bb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle BigInt in JSON body serializer

- [#1646](https://github.com/hey-api/openapi-ts/pull/1646) [`2cbffeb`](https://github.com/hey-api/openapi-ts/commit/2cbffeb2cdd6c6143cd68cac68369584879dda31) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: remove client from Options interface

- [#1646](https://github.com/hey-api/openapi-ts/pull/1646) [`2cbffeb`](https://github.com/hey-api/openapi-ts/commit/2cbffeb2cdd6c6143cd68cac68369584879dda31) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export TDataShape interface

- [#1649](https://github.com/hey-api/openapi-ts/pull/1649) [`603541e`](https://github.com/hey-api/openapi-ts/commit/603541e307dc2953da7dddd300176865629b50bb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle reactive refs in Nuxt client body

## 0.1.2

### Patch Changes

- [#1626](https://github.com/hey-api/openapi-ts/pull/1626) [`8eba19d`](https://github.com/hey-api/openapi-ts/commit/8eba19d4092fc0903572ab9fdadf0b4c26928ba2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export CreateClientConfig type

## 0.1.1

### Patch Changes

- [#1600](https://github.com/hey-api/openapi-ts/pull/1600) [`0432418`](https://github.com/hey-api/openapi-ts/commit/0432418d72c94ef94865f8216ed2f723ad5191f9) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: bundle clients from compiled index file

- [#1596](https://github.com/hey-api/openapi-ts/pull/1596) [`4784727`](https://github.com/hey-api/openapi-ts/commit/47847276e8bc854045044dd414382080270dd779) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add null to valid bodySerializer types

## 0.1.0

### Minor Changes

- [#1519](https://github.com/hey-api/openapi-ts/pull/1519) [`14d3c4c`](https://github.com/hey-api/openapi-ts/commit/14d3c4ce0393d543e2d3aaebbfcf8f0cf32483b0) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: initial release
