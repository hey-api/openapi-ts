# @hey-api/client-fetch

## 0.8.4

### Patch Changes

- [#1850](https://github.com/hey-api/openapi-ts/pull/1850) [`fe43b88`](https://github.com/hey-api/openapi-ts/commit/fe43b889c20a2001f56e259f93f64851a1caa1d1) Thanks [@kelnos](https://github.com/kelnos)! - feat: add support for cookies auth

## 0.8.3

### Patch Changes

- [#1774](https://github.com/hey-api/openapi-ts/pull/1774) [`c0b36b9`](https://github.com/hey-api/openapi-ts/commit/c0b36b95645d484034c3af145c5554867568979b) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: announce Hey API platform

## 0.8.2

### Patch Changes

- [#1753](https://github.com/hey-api/openapi-ts/pull/1753) [`b8cc9f8`](https://github.com/hey-api/openapi-ts/commit/b8cc9f8a5eaf4f4ff345abc49c14c6b96744c2ea) Thanks [@LinuCC](https://github.com/LinuCC)! - fix: dropping Content-Type header with falsey but valid json body

## 0.8.1

### Patch Changes

- [#1674](https://github.com/hey-api/openapi-ts/pull/1674) [`7f0f4a7`](https://github.com/hey-api/openapi-ts/commit/7f0f4a76b06c8fafb33581b522faf8efc6fd85ac) Thanks [@ale18V](https://github.com/ale18V)! - Return a string from urlSearchParamsBodySerializer instead of a URLSearchParams object.
  This is due to some runtimes not being able to handle the URLSearchParams object as fetch body.

## 0.8.0

### Minor Changes

- [#1661](https://github.com/hey-api/openapi-ts/pull/1661) [`bb6d46a`](https://github.com/hey-api/openapi-ts/commit/bb6d46ae119ce4e7e3a2ab3fded74ac4fb4cdff2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: make createConfig, CreateClientConfig, and Config accept ClientOptions generic

  ### Added `ClientOptions` interface

  The `Config` interface now accepts an optional generic extending `ClientOptions` instead of `boolean` type `ThrowOnError`.

  ```ts
  type Foo = Config<false>; // [!code --]
  type Foo = Config<{ throwOnError: false }>; // [!code ++]
  ```

## 0.7.3

### Patch Changes

- [#1637](https://github.com/hey-api/openapi-ts/pull/1637) [`2dc380e`](https://github.com/hey-api/openapi-ts/commit/2dc380eabc17c723654beb04ecd7bce6d33d3b49) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update keywords in package.json

- [#1649](https://github.com/hey-api/openapi-ts/pull/1649) [`603541e`](https://github.com/hey-api/openapi-ts/commit/603541e307dc2953da7dddd300176865629b50bb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle BigInt in JSON body serializer

- [#1646](https://github.com/hey-api/openapi-ts/pull/1646) [`2cbffeb`](https://github.com/hey-api/openapi-ts/commit/2cbffeb2cdd6c6143cd68cac68369584879dda31) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: remove client from Options interface

- [#1646](https://github.com/hey-api/openapi-ts/pull/1646) [`2cbffeb`](https://github.com/hey-api/openapi-ts/commit/2cbffeb2cdd6c6143cd68cac68369584879dda31) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export TDataShape interface

## 0.7.2

### Patch Changes

- [#1626](https://github.com/hey-api/openapi-ts/pull/1626) [`8eba19d`](https://github.com/hey-api/openapi-ts/commit/8eba19d4092fc0903572ab9fdadf0b4c26928ba2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export CreateClientConfig type

## 0.7.1

### Patch Changes

- [#1600](https://github.com/hey-api/openapi-ts/pull/1600) [`0432418`](https://github.com/hey-api/openapi-ts/commit/0432418d72c94ef94865f8216ed2f723ad5191f9) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: bundle clients from compiled index file

- [#1596](https://github.com/hey-api/openapi-ts/pull/1596) [`4784727`](https://github.com/hey-api/openapi-ts/commit/47847276e8bc854045044dd414382080270dd779) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add null to valid bodySerializer types

## 0.7.0

### Minor Changes

- [#1568](https://github.com/hey-api/openapi-ts/pull/1568) [`465410c`](https://github.com/hey-api/openapi-ts/commit/465410c201eb19e737e3143ad53a146e95f80107) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: change the default parser

## 0.6.0

### Minor Changes

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

- **BREAKING**: rename exported Security interface to Auth

- [#1507](https://github.com/hey-api/openapi-ts/pull/1507) [`e2e1410`](https://github.com/hey-api/openapi-ts/commit/e2e1410b22c0c84c40d1b1803e9650d546350cb7) Thanks [@nimobeeren](https://github.com/nimobeeren)! - **BREAKING**: return raw response body (of type `ReadableStream`) when `Content-Type` response header is not provided and `parseAs` is set to `auto`

## 0.5.7

### Patch Changes

- [#1468](https://github.com/hey-api/openapi-ts/pull/1468) [`20d7497`](https://github.com/hey-api/openapi-ts/commit/20d7497acb6c046f6a4206c2d8137414e17b2263) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle indexed access checks

- [#1471](https://github.com/hey-api/openapi-ts/pull/1471) [`f86d293`](https://github.com/hey-api/openapi-ts/commit/f86d293f18f133ef6dd2f4864d037611b81edd26) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add links to the experimental parser callouts

## 0.5.6

### Patch Changes

- [#1452](https://github.com/hey-api/openapi-ts/pull/1452) [`ba56424`](https://github.com/hey-api/openapi-ts/commit/ba5642486cdd5461c2372c34b63019c02bc6874e) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export Security interface

## 0.5.5

### Patch Changes

- [#1430](https://github.com/hey-api/openapi-ts/pull/1430) [`9cec9e8`](https://github.com/hey-api/openapi-ts/commit/9cec9e8582c12a8c041b922d9587e16f6f19782a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add responseValidator option

## 0.5.4

### Patch Changes

- [#1424](https://github.com/hey-api/openapi-ts/pull/1424) [`cbf4e84`](https://github.com/hey-api/openapi-ts/commit/cbf4e84db7f3a47f19d8c3eaa87c71b27912c1a2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: assign fetch to variable before sending requests

## 0.5.3

### Patch Changes

- [#1409](https://github.com/hey-api/openapi-ts/pull/1409) [`646064d`](https://github.com/hey-api/openapi-ts/commit/646064d1aecea988d2b4df73bd24b2ee83394ae0) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: support oauth2 and apiKey security schemes

## 0.5.2

### Patch Changes

- [#1394](https://github.com/hey-api/openapi-ts/pull/1394) [`ec48d32`](https://github.com/hey-api/openapi-ts/commit/ec48d323d80de8e6a47ce7ecd732288f0a47e17a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: disallow additional query parameters in experimental parser output

## 0.5.1

### Patch Changes

- [#1391](https://github.com/hey-api/openapi-ts/pull/1391) [`fa8b0f1`](https://github.com/hey-api/openapi-ts/commit/fa8b0f11ed99c63f694a494944ccc2fbfa9706cc) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: assign default fetch implementation dynamically to work with msw

## 0.5.0

### Minor Changes

- [#1333](https://github.com/hey-api/openapi-ts/pull/1333) [`734a62d`](https://github.com/hey-api/openapi-ts/commit/734a62dd8d594b8266964fe16766a481d37eb7df) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add buildUrl() method

  ## Build URL

  ::: warning
  To use this feature, you must opt in to the [experimental parser](/openapi-ts/configuration#parser).
  :::

  If you need to access the compiled URL, you can use the `buildUrl()` method. It's loosely typed by default to accept almost any value; in practice, you will want to pass a type hint.

  ```ts
  type FooData = {
    path: {
      fooId: number;
    };
    query?: {
      bar?: string;
    };
    url: '/foo/{fooId}';
  };

  const url = client.buildUrl<FooData>({
    path: {
      fooId: 1,
    },
    query: {
      bar: 'baz',
    },
    url: '/foo/{fooId}',
  });
  console.log(url); // prints '/foo/1?bar=baz'
  ```

### Patch Changes

- [#1333](https://github.com/hey-api/openapi-ts/pull/1333) [`734a62d`](https://github.com/hey-api/openapi-ts/commit/734a62dd8d594b8266964fe16766a481d37eb7df) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: experimental parser generates url inside data types

## 0.4.4

### Patch Changes

- [#1296](https://github.com/hey-api/openapi-ts/pull/1296) [`4c853d0`](https://github.com/hey-api/openapi-ts/commit/4c853d090b79245854d13831f64731db4a92978b) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle charset in auto parseAs detection

## 0.4.3

### Patch Changes

- [#1253](https://github.com/hey-api/openapi-ts/pull/1253) [`01dee3d`](https://github.com/hey-api/openapi-ts/commit/01dee3df879232939e43355231147b3d910fb482) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update sponsorship links

## 0.4.2

### Patch Changes

- [#1151](https://github.com/hey-api/openapi-ts/pull/1151) [`587791d`](https://github.com/hey-api/openapi-ts/commit/587791dfede0167fbed229281467e4c4875936f5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update website domain, add license documentation

## 0.4.1

### Patch Changes

- [#1145](https://github.com/hey-api/openapi-ts/pull/1145) [`a0a5551`](https://github.com/hey-api/openapi-ts/commit/a0a55510d30a1a8dea0ade4908b5b13d51b5f9e6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update license field in package.json to match the license, revert client packages license to MIT

## 0.4.0

### Minor Changes

- [#1098](https://github.com/hey-api/openapi-ts/pull/1098) [`df5c690`](https://github.com/hey-api/openapi-ts/commit/df5c69048a03a1c7729a5200c586164287a8a6fa) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add error interceptors

### Patch Changes

- [#1098](https://github.com/hey-api/openapi-ts/pull/1098) [`df5c690`](https://github.com/hey-api/openapi-ts/commit/df5c69048a03a1c7729a5200c586164287a8a6fa) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: throw raw error when throwOnError is true

## 0.3.4

### Patch Changes

- [#1092](https://github.com/hey-api/openapi-ts/pull/1092) [`7f986c2`](https://github.com/hey-api/openapi-ts/commit/7f986c2c7726ed8fbf16f8b235b7769c7d990502) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export RequestResult type

## 0.3.3

### Patch Changes

- [#1083](https://github.com/hey-api/openapi-ts/pull/1083) [`fe743c2`](https://github.com/hey-api/openapi-ts/commit/fe743c2d41c23bf7e1706bceedd6319299131197) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export client-facing types again

## 0.3.2

### Patch Changes

- [#1075](https://github.com/hey-api/openapi-ts/pull/1075) [`11a276a`](https://github.com/hey-api/openapi-ts/commit/11a276a1e35dde0735363e892d8142016fd87eec) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: properly handle dual publishing and type generation

## 0.3.1

### Patch Changes

- [#1057](https://github.com/hey-api/openapi-ts/pull/1057) [`7ae2b1d`](https://github.com/hey-api/openapi-ts/commit/7ae2b1db047f3b6efe917a8b43ac7c851fb86c8f) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: allow responseTransformer property with body and headers

- [#1064](https://github.com/hey-api/openapi-ts/pull/1064) [`2079c6e`](https://github.com/hey-api/openapi-ts/commit/2079c6e83a6b71e157c8e7ea56260b4e9ff8411d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: encode path params

## 0.3.0

### Minor Changes

- [#1011](https://github.com/hey-api/openapi-ts/pull/1011) [`7ebc1d4`](https://github.com/hey-api/openapi-ts/commit/7ebc1d44af74db2522219d71d240325f6bc5689d) Thanks [@goltra](https://github.com/goltra)! - feat: Function to clear and check if exist an interceptor in client-fetch

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
