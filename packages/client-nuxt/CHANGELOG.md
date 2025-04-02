# @hey-api/client-nuxt

## 0.4.0

### Minor Changes

- [#1889](https://github.com/hey-api/openapi-ts/pull/1889) [`67c385b`](https://github.com/hey-api/openapi-ts/commit/67c385bf6289a79726b0cdd85fd81ca501cf2248) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add @hey-api/openapi-ts to peer dependencies

## 0.3.1

### Patch Changes

- [#1850](https://github.com/hey-api/openapi-ts/pull/1850) [`fe43b88`](https://github.com/hey-api/openapi-ts/commit/fe43b889c20a2001f56e259f93f64851a1caa1d1) Thanks [@kelnos](https://github.com/kelnos)! - feat: add support for cookies auth

## 0.3.0

### Minor Changes

- [#1800](https://github.com/hey-api/openapi-ts/pull/1800) [`d80f835`](https://github.com/hey-api/openapi-ts/commit/d80f835b46775a01451f02f832ceb288c2b561d2) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: drop cjs support

## 0.2.4

### Patch Changes

- [#1774](https://github.com/hey-api/openapi-ts/pull/1774) [`c0b36b9`](https://github.com/hey-api/openapi-ts/commit/c0b36b95645d484034c3af145c5554867568979b) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: announce Hey API platform

## 0.2.3

### Patch Changes

- [#1753](https://github.com/hey-api/openapi-ts/pull/1753) [`b8cc9f8`](https://github.com/hey-api/openapi-ts/commit/b8cc9f8a5eaf4f4ff345abc49c14c6b96744c2ea) Thanks [@LinuCC](https://github.com/LinuCC)! - fix: dropping Content-Type header with falsey but valid json body

## 0.2.2

### Patch Changes

- [#1701](https://github.com/hey-api/openapi-ts/pull/1701) [`e86629b`](https://github.com/hey-api/openapi-ts/commit/e86629bfa9ae2a47131d3a9a240a6aa2a4f67911) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly type default value for Nuxt client

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
