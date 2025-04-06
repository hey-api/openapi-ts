# @hey-api/client-axios

## 0.7.0

### Minor Changes

- [#1889](https://github.com/hey-api/openapi-ts/pull/1889) [`67c385b`](https://github.com/hey-api/openapi-ts/commit/67c385bf6289a79726b0cdd85fd81ca501cf2248) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add @hey-api/openapi-ts to peer dependencies

## 0.6.3

### Patch Changes

- [#1850](https://github.com/hey-api/openapi-ts/pull/1850) [`fe43b88`](https://github.com/hey-api/openapi-ts/commit/fe43b889c20a2001f56e259f93f64851a1caa1d1) Thanks [@kelnos](https://github.com/kelnos)! - feat: add support for cookies auth

## 0.6.2

### Patch Changes

- [#1774](https://github.com/hey-api/openapi-ts/pull/1774) [`c0b36b9`](https://github.com/hey-api/openapi-ts/commit/c0b36b95645d484034c3af145c5554867568979b) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: announce Hey API platform

## 0.6.1

### Patch Changes

- [#1674](https://github.com/hey-api/openapi-ts/pull/1674) [`7f0f4a7`](https://github.com/hey-api/openapi-ts/commit/7f0f4a76b06c8fafb33581b522faf8efc6fd85ac) Thanks [@ale18V](https://github.com/ale18V)! - Return a string from urlSearchParamsBodySerializer instead of a URLSearchParams object.
  This is due to some runtimes not being able to handle the URLSearchParams object as fetch body.

## 0.6.0

### Minor Changes

- [#1661](https://github.com/hey-api/openapi-ts/pull/1661) [`bb6d46a`](https://github.com/hey-api/openapi-ts/commit/bb6d46ae119ce4e7e3a2ab3fded74ac4fb4cdff2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: make createConfig, CreateClientConfig, and Config accept ClientOptions generic

  ### Added `ClientOptions` interface

  The `Config` interface now accepts an optional generic extending `ClientOptions` instead of `boolean` type `ThrowOnError`.

  ```ts
  type Foo = Config<false>; // [!code --]
  type Foo = Config<{ throwOnError: false }>; // [!code ++]
  ```

## 0.5.3

### Patch Changes

- [#1637](https://github.com/hey-api/openapi-ts/pull/1637) [`2dc380e`](https://github.com/hey-api/openapi-ts/commit/2dc380eabc17c723654beb04ecd7bce6d33d3b49) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update keywords in package.json

- [#1649](https://github.com/hey-api/openapi-ts/pull/1649) [`603541e`](https://github.com/hey-api/openapi-ts/commit/603541e307dc2953da7dddd300176865629b50bb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle BigInt in JSON body serializer

- [#1646](https://github.com/hey-api/openapi-ts/pull/1646) [`2cbffeb`](https://github.com/hey-api/openapi-ts/commit/2cbffeb2cdd6c6143cd68cac68369584879dda31) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: remove client from Options interface

- [#1646](https://github.com/hey-api/openapi-ts/pull/1646) [`2cbffeb`](https://github.com/hey-api/openapi-ts/commit/2cbffeb2cdd6c6143cd68cac68369584879dda31) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export TDataShape interface

## 0.5.2

### Patch Changes

- [#1626](https://github.com/hey-api/openapi-ts/pull/1626) [`8eba19d`](https://github.com/hey-api/openapi-ts/commit/8eba19d4092fc0903572ab9fdadf0b4c26928ba2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export CreateClientConfig type

## 0.5.1

### Patch Changes

- [#1600](https://github.com/hey-api/openapi-ts/pull/1600) [`0432418`](https://github.com/hey-api/openapi-ts/commit/0432418d72c94ef94865f8216ed2f723ad5191f9) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: bundle clients from compiled index file

- [#1596](https://github.com/hey-api/openapi-ts/pull/1596) [`4784727`](https://github.com/hey-api/openapi-ts/commit/47847276e8bc854045044dd414382080270dd779) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add null to valid bodySerializer types

## 0.5.0

### Minor Changes

- [#1568](https://github.com/hey-api/openapi-ts/pull/1568) [`465410c`](https://github.com/hey-api/openapi-ts/commit/465410c201eb19e737e3143ad53a146e95f80107) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: change the default parser

## 0.4.0

### Minor Changes

- **BREAKING**: rename exported Security interface to Auth

- **BREAKING**: remove support for passing auth to Axios instance

- **BREAKING**: please update `@hey-api/openapi-ts` to the latest version

  feat: replace accessToken and apiKey functions with auth

  ### Added `auth` option

  Client package functions `accessToken` and `apiKey` were replaced with a single `auth` function for fetching auth tokens. If your API supports multiple auth mechanisms, you can use the `auth` argument to return the appropriate token.

  ```js
  import { client } from 'client/sdk.gen';

  client.setConfig({
    accessToken: () => '<my_token>', // [!code --]
    apiKey: () => '<my_token>', // [!code --]
    auth: (auth) => '<my_token>', // [!code ++]
  });
  ```

  Due to conflict with the Axios native `auth` option, we removed support for configuring Axios auth. Please let us know if you require this feature added back.

## 0.3.4

### Patch Changes

- [#1468](https://github.com/hey-api/openapi-ts/pull/1468) [`20d7497`](https://github.com/hey-api/openapi-ts/commit/20d7497acb6c046f6a4206c2d8137414e17b2263) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle indexed access checks

- [#1471](https://github.com/hey-api/openapi-ts/pull/1471) [`f86d293`](https://github.com/hey-api/openapi-ts/commit/f86d293f18f133ef6dd2f4864d037611b81edd26) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add links to the experimental parser callouts

- [#1470](https://github.com/hey-api/openapi-ts/pull/1470) [`458ef50`](https://github.com/hey-api/openapi-ts/commit/458ef500a18127a618dd1e14e14e20014027e77d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle special Axios keywords when merging headers

## 0.3.3

### Patch Changes

- [#1452](https://github.com/hey-api/openapi-ts/pull/1452) [`ba56424`](https://github.com/hey-api/openapi-ts/commit/ba5642486cdd5461c2372c34b63019c02bc6874e) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export Security interface

## 0.3.2

### Patch Changes

- [#1430](https://github.com/hey-api/openapi-ts/pull/1430) [`9cec9e8`](https://github.com/hey-api/openapi-ts/commit/9cec9e8582c12a8c041b922d9587e16f6f19782a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add responseValidator option

## 0.3.1

### Patch Changes

- [#1424](https://github.com/hey-api/openapi-ts/pull/1424) [`cbf4e84`](https://github.com/hey-api/openapi-ts/commit/cbf4e84db7f3a47f19d8c3eaa87c71b27912c1a2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: assign axios to variable before sending requests

## 0.3.0

### Minor Changes

- [#1420](https://github.com/hey-api/openapi-ts/pull/1420) [`8010dbb`](https://github.com/hey-api/openapi-ts/commit/8010dbb1ab8b91d1d49d5cf16276183764a63ff3) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: handle parameter styles the same way fetch client does if paramsSerializer is undefined

### Patch Changes

- [#1420](https://github.com/hey-api/openapi-ts/pull/1420) [`8010dbb`](https://github.com/hey-api/openapi-ts/commit/8010dbb1ab8b91d1d49d5cf16276183764a63ff3) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add buildUrl method to Axios client API

- [#1409](https://github.com/hey-api/openapi-ts/pull/1409) [`646064d`](https://github.com/hey-api/openapi-ts/commit/646064d1aecea988d2b4df73bd24b2ee83394ae0) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: support oauth2 and apiKey security schemes

## 0.2.12

### Patch Changes

- [#1394](https://github.com/hey-api/openapi-ts/pull/1394) [`ec48d32`](https://github.com/hey-api/openapi-ts/commit/ec48d323d80de8e6a47ce7ecd732288f0a47e17a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: disallow additional query parameters in experimental parser output

## 0.2.11

### Patch Changes

- [#1333](https://github.com/hey-api/openapi-ts/pull/1333) [`734a62d`](https://github.com/hey-api/openapi-ts/commit/734a62dd8d594b8266964fe16766a481d37eb7df) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: experimental parser generates url inside data types

## 0.2.10

### Patch Changes

- [#1253](https://github.com/hey-api/openapi-ts/pull/1253) [`01dee3d`](https://github.com/hey-api/openapi-ts/commit/01dee3df879232939e43355231147b3d910fb482) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update sponsorship links

## 0.2.9

### Patch Changes

- [#1151](https://github.com/hey-api/openapi-ts/pull/1151) [`587791d`](https://github.com/hey-api/openapi-ts/commit/587791dfede0167fbed229281467e4c4875936f5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update website domain, add license documentation

## 0.2.8

### Patch Changes

- [#1145](https://github.com/hey-api/openapi-ts/pull/1145) [`a0a5551`](https://github.com/hey-api/openapi-ts/commit/a0a55510d30a1a8dea0ade4908b5b13d51b5f9e6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update license field in package.json to match the license, revert client packages license to MIT

## 0.2.7

### Patch Changes

- [#1092](https://github.com/hey-api/openapi-ts/pull/1092) [`7f986c2`](https://github.com/hey-api/openapi-ts/commit/7f986c2c7726ed8fbf16f8b235b7769c7d990502) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export RequestResult type

## 0.2.6

### Patch Changes

- [#1083](https://github.com/hey-api/openapi-ts/pull/1083) [`fe743c2`](https://github.com/hey-api/openapi-ts/commit/fe743c2d41c23bf7e1706bceedd6319299131197) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export client-facing types again

## 0.2.5

### Patch Changes

- [#1075](https://github.com/hey-api/openapi-ts/pull/1075) [`11a276a`](https://github.com/hey-api/openapi-ts/commit/11a276a1e35dde0735363e892d8142016fd87eec) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: properly handle dual publishing and type generation

## 0.2.4

### Patch Changes

- [#1057](https://github.com/hey-api/openapi-ts/pull/1057) [`7ae2b1d`](https://github.com/hey-api/openapi-ts/commit/7ae2b1db047f3b6efe917a8b43ac7c851fb86c8f) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: allow responseTransformer property with body and headers

- [#1064](https://github.com/hey-api/openapi-ts/pull/1064) [`2079c6e`](https://github.com/hey-api/openapi-ts/commit/2079c6e83a6b71e157c8e7ea56260b4e9ff8411d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: encode path params

## 0.2.3

### Patch Changes

- [#901](https://github.com/hey-api/openapi-ts/pull/901) [`7825a2f`](https://github.com/hey-api/openapi-ts/commit/7825a2fba566a76c63775172ef0569ef375406b6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export more types to resolve TypeScript errors

## 0.2.2

### Patch Changes

- [#895](https://github.com/hey-api/openapi-ts/pull/895) [`44de8d8`](https://github.com/hey-api/openapi-ts/commit/44de8d89556b3abf48acc4e23c9b9c198059c757) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: define ThrowOnError generic as the last argument

## 0.2.1

### Patch Changes

- [#864](https://github.com/hey-api/openapi-ts/pull/864) [`ec6bfc8`](https://github.com/hey-api/openapi-ts/commit/ec6bfc8292cce7663dfc6e0fcd89b44c56f08bb4) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: infer response shape based on throwOnError option value

- [#873](https://github.com/hey-api/openapi-ts/pull/873) [`a73da1c`](https://github.com/hey-api/openapi-ts/commit/a73da1c854503246b6c58f1abea5dd77727eedca) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export RequestOptionsBase interface

## 0.2.0

### Minor Changes

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`babf11a`](https://github.com/hey-api/openapi-ts/commit/babf11ae082af642ac71cfee9c523cc976132a50) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: remove default client export (see migration docs)

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`babf11a`](https://github.com/hey-api/openapi-ts/commit/babf11ae082af642ac71cfee9c523cc976132a50) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add `setConfig()` method

## 0.1.1

### Patch Changes

- [#811](https://github.com/hey-api/openapi-ts/pull/811) [`f8e0b7b`](https://github.com/hey-api/openapi-ts/commit/f8e0b7b7ab5cbd673ca13a21fd1180194558c7f5) Thanks [@chirino](https://github.com/chirino)! - fix: declare axios body to be unknown so that it can be set to anything

## 0.1.0

### Minor Changes

- [#613](https://github.com/hey-api/openapi-ts/pull/613) [`b3786dc`](https://github.com/hey-api/openapi-ts/commit/b3786dc6749d8d4ae26bb63322e124663f881741) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: initial release
