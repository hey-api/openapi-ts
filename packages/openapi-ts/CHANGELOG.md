# @hey-api/openapi-ts

## 0.62.0

### Minor Changes

- [#1568](https://github.com/hey-api/openapi-ts/pull/1568) [`465410c`](https://github.com/hey-api/openapi-ts/commit/465410c201eb19e737e3143ad53a146e95f80107) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: change the default parser

### Patch Changes

- [#1566](https://github.com/hey-api/openapi-ts/pull/1566) [`39d558a`](https://github.com/hey-api/openapi-ts/commit/39d558afc6af97fe8de1a6471b9d1f172ec2960a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: spread sdk options at the end to allow overriding generated values

## 0.61.3

### Patch Changes

- [#1552](https://github.com/hey-api/openapi-ts/pull/1552) [`ceb8bd7`](https://github.com/hey-api/openapi-ts/commit/ceb8bd74207566871e9f179cb28b2d8c440ef2c8) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: use z.coerce before calling z.bigint

## 0.61.2

### Patch Changes

- [#1543](https://github.com/hey-api/openapi-ts/pull/1543) [`7a2d6dc`](https://github.com/hey-api/openapi-ts/commit/7a2d6dcd6e30411178ac5c78db3f1dbbcc8d6b27) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: send GET request only on first spec fetch

## 0.61.1

### Patch Changes

- [#1530](https://github.com/hey-api/openapi-ts/pull/1530) [`67b7295`](https://github.com/hey-api/openapi-ts/commit/67b72959be499ff59f5f68bfdaa7e5568f5de02f) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: detect pagination in composite schemas with null type

- [#1535](https://github.com/hey-api/openapi-ts/pull/1535) [`d4cfa05`](https://github.com/hey-api/openapi-ts/commit/d4cfa05ed425d57f79b28efe76e6a33f1e892ec5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle primitive constants in Zod and types

## 0.61.0

### Minor Changes

- [#1520](https://github.com/hey-api/openapi-ts/pull/1520) [`b3c23ba`](https://github.com/hey-api/openapi-ts/commit/b3c23ba99c361bdca3ab9c44017b6e5c044f40a7) Thanks [@chriswiggins](https://github.com/chriswiggins)! - Add support for HTTP Bearer Authentication Scheme

- [#1525](https://github.com/hey-api/openapi-ts/pull/1525) [`7b7313e`](https://github.com/hey-api/openapi-ts/commit/7b7313eeaf9a749fb81465546bc4e4bdce31d5ab) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add OpenAPI 2.0 support to experimental parser

- [#1511](https://github.com/hey-api/openapi-ts/pull/1511) [`4e8064d`](https://github.com/hey-api/openapi-ts/commit/4e8064d9a589e14b42d2b1a329e2436f242884da) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add watch mode

  ## Watch Mode

  ::: warning
  Watch mode currently supports only remote files via URL.
  :::

  If your schema changes frequently, you may want to automatically regenerate the output during development. To watch your input file for changes, enable `watch` mode in your configuration or pass the `--watch` flag to the CLI.

  ### Config

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    watch: true,
  };
  ```

  ### CLI

  ```sh
  npx @hey-api/openapi-ts \
    -c @hey-api/client-fetch \
    -i path/to/openapi.json \
    -o src/client \
    -w
  ```

- **BREAKING**: please update `@hey-api/client-*` packages to the latest version

  feat: add support for basic http auth

### Patch Changes

- [#1529](https://github.com/hey-api/openapi-ts/pull/1529) [`ccc0bbc`](https://github.com/hey-api/openapi-ts/commit/ccc0bbcbdeace22bbd8e92caadebdca81e61e393) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add support for long integers

- [#1512](https://github.com/hey-api/openapi-ts/pull/1512) [`dd0e0a2`](https://github.com/hey-api/openapi-ts/commit/dd0e0a266153e34448fbc3db6b0f864f75483280) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add `sdk.throwOnError` option

- [#1525](https://github.com/hey-api/openapi-ts/pull/1525) [`7b7313e`](https://github.com/hey-api/openapi-ts/commit/7b7313eeaf9a749fb81465546bc4e4bdce31d5ab) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: preserve leading separators in enum keys

## 0.60.1

### Patch Changes

- [#1468](https://github.com/hey-api/openapi-ts/pull/1468) [`20d7497`](https://github.com/hey-api/openapi-ts/commit/20d7497acb6c046f6a4206c2d8137414e17b2263) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle indexed access checks

- [#1469](https://github.com/hey-api/openapi-ts/pull/1469) [`a7608c2`](https://github.com/hey-api/openapi-ts/commit/a7608c27ced3419dee228f4b0cd96479b3dc2c04) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: zod: generate patterns and improve plain schemas

- [#1471](https://github.com/hey-api/openapi-ts/pull/1471) [`f86d293`](https://github.com/hey-api/openapi-ts/commit/f86d293f18f133ef6dd2f4864d037611b81edd26) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add links to the experimental parser callouts

- [#1462](https://github.com/hey-api/openapi-ts/pull/1462) [`893d6ef`](https://github.com/hey-api/openapi-ts/commit/893d6ef5677d17b96174f505937f6da686abb2bc) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update types for custom plugins so defineConfig does not throw

- [#1464](https://github.com/hey-api/openapi-ts/pull/1464) [`787d59c`](https://github.com/hey-api/openapi-ts/commit/787d59c307549f5faf9f83314a8e9692bb01eb5d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export IR types

- [#1467](https://github.com/hey-api/openapi-ts/pull/1467) [`3a3f8d7`](https://github.com/hey-api/openapi-ts/commit/3a3f8d7ea4c993d4372e4bc52f6d9525bf1e45b6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export utils

- [#1457](https://github.com/hey-api/openapi-ts/pull/1457) [`bc03c37`](https://github.com/hey-api/openapi-ts/commit/bc03c373f4df61d8d715dc13badba2a6c5a3a450) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: allow plugins to explicitly declare whether they should be re-exported from the index file

## 0.60.0

### Minor Changes

- [#1430](https://github.com/hey-api/openapi-ts/pull/1430) [`9cec9e8`](https://github.com/hey-api/openapi-ts/commit/9cec9e8582c12a8c041b922d9587e16f6f19782a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: require sdk.transformer to use generated transformers

  ### Added `sdk.transformer` option

  When generating SDKs, you now have to specify `transformer` in order to modify response data. By default, adding `@hey-api/transformers` to your plugins will only produce additional output. To preserve the previous functionality, set `sdk.transformer` to `true`.

  ```js
  import { defaultPlugins } from '@hey-api/openapi-ts';

  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    plugins: [
      ...defaultPlugins,
      {
        dates: true,
        name: '@hey-api/transformers',
      },
      {
        name: '@hey-api/sdk',
        transformer: true, // [!code ++]
      },
    ],
  };
  ```

- [#1447](https://github.com/hey-api/openapi-ts/pull/1447) [`200821b`](https://github.com/hey-api/openapi-ts/commit/200821b3ceea8ffca7656fe3f6e2ef98b7110a2a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: revert license to MIT

### Patch Changes

- [#1430](https://github.com/hey-api/openapi-ts/pull/1430) [`9cec9e8`](https://github.com/hey-api/openapi-ts/commit/9cec9e8582c12a8c041b922d9587e16f6f19782a) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: Zod plugin generates response schemas

## 0.59.2

### Patch Changes

- [#1420](https://github.com/hey-api/openapi-ts/pull/1420) [`8010dbb`](https://github.com/hey-api/openapi-ts/commit/8010dbb1ab8b91d1d49d5cf16276183764a63ff3) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: generate querySerializer options for Axios client

- [#1419](https://github.com/hey-api/openapi-ts/pull/1419) [`4555796`](https://github.com/hey-api/openapi-ts/commit/4555796df3a33fb3fdf7d7417f7d1f3b22d89bcf) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: infer responseType in SDKs for axios client

- [#1409](https://github.com/hey-api/openapi-ts/pull/1409) [`646064d`](https://github.com/hey-api/openapi-ts/commit/646064d1aecea988d2b4df73bd24b2ee83394ae0) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: support oauth2 and apiKey security schemes

- [#1416](https://github.com/hey-api/openapi-ts/pull/1416) [`2a605b7`](https://github.com/hey-api/openapi-ts/commit/2a605b7e43655b3100e302e10b9979fbbad6cdfe) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: zod plugin handles recursive schemas

## 0.59.1

### Patch Changes

- [#1398](https://github.com/hey-api/openapi-ts/pull/1398) [`a88e7d9`](https://github.com/hey-api/openapi-ts/commit/a88e7d9f8a313c641cf651256a710d0610b95b5d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: prefix restricted identifier names with underscore

- [#1394](https://github.com/hey-api/openapi-ts/pull/1394) [`ec48d32`](https://github.com/hey-api/openapi-ts/commit/ec48d323d80de8e6a47ce7ecd732288f0a47e17a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: disallow additional query parameters in experimental parser output

## 0.59.0

### Minor Changes

- [#1387](https://github.com/hey-api/openapi-ts/pull/1387) [`7c4335d`](https://github.com/hey-api/openapi-ts/commit/7c4335d12782c73b5b242e7d5786ec8778857d1d) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add `logs.level` option

  ### Added `logs.level` option

  You can now configure different log levels. As part of this feature, we had to introduce a breaking change by moving the `debug` option to `logs.level`. This will affect you if you're calling `@hey-api/openapi-ts` from Node.js (not CLI) or using the configuration file.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    debug: true, // [!code --]
    input: 'path/to/openapi.json',
    logs: {
      level: 'debug', // [!code ++]
    },
    output: 'src/client',
  };
  ```

- [#1389](https://github.com/hey-api/openapi-ts/pull/1389) [`f4c98ec`](https://github.com/hey-api/openapi-ts/commit/f4c98ec429ee989ae1c76328f4d42d44f14cb52e) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: remove `@hey-api/schemas` from default plugins

  ### Updated default `plugins`

  `@hey-api/schemas` has been removed from the default plugins. To continue using it, add it to your plugins array.

  ```js
  import { defaultPlugins } from '@hey-api/openapi-ts';

  export default {
    client: '@hey-api/client-fetch',
    experimentalParser: true,
    input: 'path/to/openapi.json',
    output: 'src/client',
    plugins: [
      ...defaultPlugins,
      '@hey-api/schemas', // [!code ++]
    ],
  };
  ```

### Patch Changes

- [#1382](https://github.com/hey-api/openapi-ts/pull/1382) [`3580c1e`](https://github.com/hey-api/openapi-ts/commit/3580c1eec4640d235a1e0f78bf76581e532aaf8b) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly resolve required properties in nested allOf composition

- [#1387](https://github.com/hey-api/openapi-ts/pull/1387) [`7c4335d`](https://github.com/hey-api/openapi-ts/commit/7c4335d12782c73b5b242e7d5786ec8778857d1d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add `--silent` or `-s` CLI option for silent log level

- [#1382](https://github.com/hey-api/openapi-ts/pull/1382) [`3580c1e`](https://github.com/hey-api/openapi-ts/commit/3580c1eec4640d235a1e0f78bf76581e532aaf8b) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: transformers handle allOf composition in experimental parser

- [#1387](https://github.com/hey-api/openapi-ts/pull/1387) [`0def82c`](https://github.com/hey-api/openapi-ts/commit/0def82c91d1be936702690b8cf5a21775974d946) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add `logs` configuration option to customize log directory

- [#1390](https://github.com/hey-api/openapi-ts/pull/1390) [`8388c47`](https://github.com/hey-api/openapi-ts/commit/8388c4720dbb657899d5e30bd8d59c19583cad98) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: allow arbitrary object properties when additionalProperties is undefined

- [#1387](https://github.com/hey-api/openapi-ts/pull/1387) [`7c4335d`](https://github.com/hey-api/openapi-ts/commit/7c4335d12782c73b5b242e7d5786ec8778857d1d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: support `DEBUG` environment variable

## 0.58.0

### Minor Changes

- [#1353](https://github.com/hey-api/openapi-ts/pull/1353) [`efd3e54`](https://github.com/hey-api/openapi-ts/commit/efd3e5444d208ea0c8dda7573f26bb04c31cc372) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add typescript.identifierCase option

  ### Added `typescript.identifierCase` option

  **This change affects only the experimental parser.** By default, the generated TypeScript interfaces will follow the PascalCase naming convention. In the previous versions, we tried to preserve the original name as much as possible. To keep the previous behavior, set `typescript.identifierCase` to `preserve`.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    experimentalParser: true,
    input: 'path/to/openapi.json',
    output: 'src/client',
    plugins: [
      // ...other plugins
      {
        identifierCase: 'preserve', // [!code ++]
        name: '@hey-api/typescript',
      },
    ],
  };
  ```

- [#1360](https://github.com/hey-api/openapi-ts/pull/1360) [`5f6ddd7`](https://github.com/hey-api/openapi-ts/commit/5f6ddd796f0ce77bcca55fd13981f2a8481aecd3) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: remove schemas and transformers re-exports from index.ts

  ### Removed `schemas.gen.ts` re-export

  `index.ts` will no longer re-export `schemas.gen.ts` to reduce the chance of producing broken output. Please update your code to import from `schemas.gen.ts` directly.

  ```js
  import { mySchema } from 'client'; // [!code --]
  import { mySchema } from 'client/schemas.gen'; // [!code ++]
  ```

  ### Removed `transformers.gen.ts` re-export

  `index.ts` will no longer re-export `transformers.gen.ts` to reduce the chance of producing broken output. Please update your code to import from `transformers.gen.ts` directly.

  ```js
  import { myTransformer } from 'client'; // [!code --]
  import { myTransformer } from 'client/transformers.gen'; // [!code ++]
  ```

- [#1360](https://github.com/hey-api/openapi-ts/pull/1360) [`5f6ddd7`](https://github.com/hey-api/openapi-ts/commit/5f6ddd796f0ce77bcca55fd13981f2a8481aecd3) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add output.clean option

  ### Added `output.clean` option

  By default, the `output.path` folder will be emptied on every run. To preserve the previous behavior, set `output.clean` to `false`.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: {
      clean: false, // [!code ++]
      path: 'src/client',
    },
  };
  ```

- [#1362](https://github.com/hey-api/openapi-ts/pull/1362) [`3bf7169`](https://github.com/hey-api/openapi-ts/commit/3bf7169b620946d99c17cf5398d7a818d0099f94) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add typescript.enumsCase option

### Patch Changes

- [#1361](https://github.com/hey-api/openapi-ts/pull/1361) [`a23c25e`](https://github.com/hey-api/openapi-ts/commit/a23c25ea1b5ca8bf421302bf93690168df3473cb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add before and after to pagination keywords

- [#1368](https://github.com/hey-api/openapi-ts/pull/1368) [`cca2290`](https://github.com/hey-api/openapi-ts/commit/cca2290aeaab0b9807c928d73dbfc1e4bacadc4d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export Plugin API namespace

- [#1369](https://github.com/hey-api/openapi-ts/pull/1369) [`11163f0`](https://github.com/hey-api/openapi-ts/commit/11163f0d6885633078126849c04c0646e7d19255) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: TanStack Query plugin handles conflict with internal function name in experimental parser

## 0.57.1

### Patch Changes

- [#1335](https://github.com/hey-api/openapi-ts/pull/1335) [`bb9a848`](https://github.com/hey-api/openapi-ts/commit/bb9a84869dc911861f3b12f725a470b8fd6b67fe) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: transformers correctly handle an array

- [#1332](https://github.com/hey-api/openapi-ts/pull/1332) [`25b598b`](https://github.com/hey-api/openapi-ts/commit/25b598bcecd1dd3eb3da6b7c7f24f4adb0170114) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: improve camelcase with abbreviated plurals

- [#1333](https://github.com/hey-api/openapi-ts/pull/1333) [`734a62d`](https://github.com/hey-api/openapi-ts/commit/734a62dd8d594b8266964fe16766a481d37eb7df) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: experimental parser generates url inside data types

- [#1336](https://github.com/hey-api/openapi-ts/pull/1336) [`6857da8`](https://github.com/hey-api/openapi-ts/commit/6857da8a7f23829a89115b2237aaac9a71a38dfb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: experimental parser transforms anyOf date and null

- [#1330](https://github.com/hey-api/openapi-ts/pull/1330) [`3d68587`](https://github.com/hey-api/openapi-ts/commit/3d6858748c94d6e33fd4dae7ddbf6cb70d21aaee) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: experimental parser handles empty string and null enum values in JavaScript mode

- [#1340](https://github.com/hey-api/openapi-ts/pull/1340) [`c8511e0`](https://github.com/hey-api/openapi-ts/commit/c8511e0d84dd408407bf764fb0bae4938b70dacb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: experimental parser exports reusable request bodies

## 0.57.0

### Minor Changes

- [#1324](https://github.com/hey-api/openapi-ts/pull/1324) [`4e62378`](https://github.com/hey-api/openapi-ts/commit/4e62378352d8306580293ee4aeef43756d245f85) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: rename Hey API plugins

  ### Renamed `@hey-api/services` plugin

  This plugin has been renamed to `@hey-api/sdk`.

  ### Changed `sdk.output` value

  To align with the updated name, the `@hey-api/sdk` plugin will generate an `sdk.gen.ts` file. This will result in a breaking change if you're importing from `services.gen.ts`. Please update your imports to reflect this change.

  ```js
  import { client } from 'client/services.gen'; // [!code --]
  import { client } from 'client/sdk.gen'; // [!code ++]
  ```

  ### Renamed `@hey-api/types` plugin

  This plugin has been renamed to `@hey-api/typescript`.

- [#1327](https://github.com/hey-api/openapi-ts/pull/1327) [`62e37d5`](https://github.com/hey-api/openapi-ts/commit/62e37d51e9d829e11d08a494060c1e808ce2e3f3) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add typescript.exportInlineEnums option

  ### Added `typescript.exportInlineEnums` option

  By default, inline enums (enums not defined as reusable components in the input file) will be generated only as inlined union types. You can set `exportInlineEnums` to `true` to treat inline enums as reusable components. When `true`, the exported enums will follow the style defined in `enums`.

  This is a breaking change since in the previous versions, inline enums were always treated as reusable components. To preserve your current output, set `exportInlineEnums` to `true`. This feature works only with the experimental parser.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    experimentalParser: true,
    input: 'path/to/openapi.json',
    output: 'src/client',
    plugins: [
      // ...other plugins
      {
        exportInlineEnums: true, // [!code ++]
        name: '@hey-api/typescript',
      },
    ],
  };
  ```

### Patch Changes

- [#1326](https://github.com/hey-api/openapi-ts/pull/1326) [`01c3d69`](https://github.com/hey-api/openapi-ts/commit/01c3d69e4c97262cd6dda5061f0a76f3b4fda31a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: improve generated enum keys in experimental parser

## 0.56.3

### Patch Changes

- [#1319](https://github.com/hey-api/openapi-ts/pull/1319) [`af76a77`](https://github.com/hey-api/openapi-ts/commit/af76a7705c585fcfae0c72872f358936f7d19d56) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: Zod plugin handles value constraints and defaults

## 0.56.2

### Patch Changes

- [#1316](https://github.com/hey-api/openapi-ts/pull/1316) [`a79fac8`](https://github.com/hey-api/openapi-ts/commit/a79fac8919ed29eec7195cbd441ffa38b559d63c) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add input.exclude option

- [#1316](https://github.com/hey-api/openapi-ts/pull/1316) [`a79fac8`](https://github.com/hey-api/openapi-ts/commit/a79fac8919ed29eec7195cbd441ffa38b559d63c) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: make Zod plugin available in plugins options

## 0.56.1

### Patch Changes

- [#1309](https://github.com/hey-api/openapi-ts/pull/1309) [`785480b`](https://github.com/hey-api/openapi-ts/commit/785480b2d5f96a681dfc1f7f0fb626f744bb221f) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: gracefully handle invalid schema type in experimental parser

## 0.56.0

### Minor Changes

- [#1286](https://github.com/hey-api/openapi-ts/pull/1286) [`5514de4`](https://github.com/hey-api/openapi-ts/commit/5514de46a8c913ddc40f07d0142c80266e9837cd) Thanks [@jacobinu](https://github.com/jacobinu)! - feat: add `fastify` plugin

### Patch Changes

- [#1286](https://github.com/hey-api/openapi-ts/pull/1286) [`cebf327`](https://github.com/hey-api/openapi-ts/commit/cebf327046c801b375846bae6b07561b8ad1bdd6) Thanks [@jacobinu](https://github.com/jacobinu)! - fix: export a map of error and response types by status code

- [#1286](https://github.com/hey-api/openapi-ts/pull/1286) [`8a15a35`](https://github.com/hey-api/openapi-ts/commit/8a15a35e86ff22eca85dc218bc1793315b934556) Thanks [@jacobinu](https://github.com/jacobinu)! - fix: deprecate types.tree option

- [#1305](https://github.com/hey-api/openapi-ts/pull/1305) [`a3698a7`](https://github.com/hey-api/openapi-ts/commit/a3698a7f1680d7dfb913c6253f8685ebbdd132ca) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle file-like content media type without explicit schema

## 0.55.3

### Patch Changes

- [#1283](https://github.com/hey-api/openapi-ts/pull/1283) [`781d1a4`](https://github.com/hey-api/openapi-ts/commit/781d1a40d10ce380f1ca2cb2bc7aca7d3b169bc6) Thanks [@hougesen](https://github.com/hougesen)! - feat: add support for oxlint as linter

## 0.55.2

### Patch Changes

- [#1253](https://github.com/hey-api/openapi-ts/pull/1253) [`01dee3d`](https://github.com/hey-api/openapi-ts/commit/01dee3df879232939e43355231147b3d910fb482) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update sponsorship links

- [#1266](https://github.com/hey-api/openapi-ts/pull/1266) [`d60d260`](https://github.com/hey-api/openapi-ts/commit/d60d260342ff3013c2e228151e9b897224eb89cc) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly generate array when items are a oneOf array with length 1

- [#1265](https://github.com/hey-api/openapi-ts/pull/1265) [`691cdc2`](https://github.com/hey-api/openapi-ts/commit/691cdc28b6ad5bc1a38e1ae9eb134a2b41d4ead8) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle non-exploded array query parameters

- [#1267](https://github.com/hey-api/openapi-ts/pull/1267) [`ff3aa4a`](https://github.com/hey-api/openapi-ts/commit/ff3aa4ac58068671d2b9eedbd7528eb4f9969386) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle discriminators in experimental parser

## 0.55.1

### Patch Changes

- [#1248](https://github.com/hey-api/openapi-ts/pull/1248) [`61cd848`](https://github.com/hey-api/openapi-ts/commit/61cd848262b20580fb185d023c28aa54754bf19c) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle nullable enums in experimental parser

- [#1251](https://github.com/hey-api/openapi-ts/pull/1251) [`07800d4`](https://github.com/hey-api/openapi-ts/commit/07800d4fbb849614ed2c23b8acc9c82f1ef74598) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add support for custom plugins

- [#1250](https://github.com/hey-api/openapi-ts/pull/1250) [`9e07675`](https://github.com/hey-api/openapi-ts/commit/9e07675802c75b8f5105dd104bb7736aeb83ece6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: render void for empty response status codes in experimental parser

## 0.55.0

### Minor Changes

- [#1241](https://github.com/hey-api/openapi-ts/pull/1241) [`41cee41`](https://github.com/hey-api/openapi-ts/commit/41cee417055c50de6170e6fdeae65bd6e643d19c) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add input.include option

### Patch Changes

- [#1239](https://github.com/hey-api/openapi-ts/pull/1239) [`319a28a`](https://github.com/hey-api/openapi-ts/commit/319a28af29541d7f61cca82389e1d486204f321f) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle pagination with basic refs

## 0.54.4

### Patch Changes

- [#1237](https://github.com/hey-api/openapi-ts/pull/1237) [`63ccc07`](https://github.com/hey-api/openapi-ts/commit/63ccc0775e24a096bc46ac7ff29b99b694aad621) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: forbid any body, path, or query parameters if not defined in spec

- [#1235](https://github.com/hey-api/openapi-ts/pull/1235) [`7a1a419`](https://github.com/hey-api/openapi-ts/commit/7a1a419f07d5ad39e07265771b30d49a4b754a88) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle additionalProperties: boolean in experimental parser

- [#1233](https://github.com/hey-api/openapi-ts/pull/1233) [`08baa77`](https://github.com/hey-api/openapi-ts/commit/08baa77afdc5e2c49d4789b20673e949951ab0b2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update schemas plugin to handle experimental 3.0.x parser

  This release adds an experimental parser for OpenAPI versions 3.0.x. In the future, this will become the default parser. If you're using OpenAPI 3.0 or newer, we encourage you to try it out today.

  You can enable the experimental parser by setting the `experimentalParser` boolean flag to `true` in your configuration file or CLI.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    experimentalParser: true,
  };
  ```

  ```sh
  npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client -c @hey-api/client-fetch -e
  ```

  The generated output should not structurally change, despite few things being generated in a different order. In fact, the output should be cleaner! That's the immediate side effect you should notice. If that's not true, please leave feedback in [GitHub issues](https://github.com/hey-api/openapi-ts/issues).

  Hey API parser marks an important milestone towards v1 of `@hey-api/openapi-ts`. More features will be added to the parser in the future and the original parser from `openapi-typescript-codegen` will be deprecated and used only for generating legacy clients.

  If you'd like to work with the parser more closely (e.g. to generate code not natively supported by this package), feel free to reach out with any feedback or suggestions. Happy parsing! 🎉

## 0.54.3

### Patch Changes

- [#1230](https://github.com/hey-api/openapi-ts/pull/1230) [`3e65ae0`](https://github.com/hey-api/openapi-ts/commit/3e65ae06bcd2823482cf012909388c7630e18229) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add OpenAPI 3.0.x experimental parser

  This release adds an experimental parser for OpenAPI versions 3.0.x. In the future, this will become the default parser. If you're using OpenAPI 3.0 or newer, we encourage you to try it out today.

  You can enable the experimental parser by setting the `experimentalParser` boolean flag to `true` in your configuration file or CLI.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    experimentalParser: true,
  };
  ```

  ```sh
  npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client -c @hey-api/client-fetch -e
  ```

  The generated output should not structurally change, despite few things being generated in a different order. In fact, the output should be cleaner! That's the immediate side effect you should notice. If that's not true, please leave feedback in [GitHub issues](https://github.com/hey-api/openapi-ts/issues).

  Hey API parser marks an important milestone towards v1 of `@hey-api/openapi-ts`. More features will be added to the parser in the future and the original parser from `openapi-typescript-codegen` will be deprecated and used only for generating legacy clients.

  If you'd like to work with the parser more closely (e.g. to generate code not natively supported by this package), feel free to reach out with any feedback or suggestions. Happy parsing! 🎉

## 0.54.2

### Patch Changes

- [#1222](https://github.com/hey-api/openapi-ts/pull/1222) [`ceb4363`](https://github.com/hey-api/openapi-ts/commit/ceb4363d52893ebe947e21aac402b868ff2820d4) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add support for @tanstack/angular-query-experimental package

## 0.54.1

### Patch Changes

- [#1211](https://github.com/hey-api/openapi-ts/pull/1211) [`c8a3e3d`](https://github.com/hey-api/openapi-ts/commit/c8a3e3d7e59692698b7cf45182ca92494fc4af96) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: ignore name option when not used with legacy clients to avoid producing broken output

- [#1209](https://github.com/hey-api/openapi-ts/pull/1209) [`3a80b9f`](https://github.com/hey-api/openapi-ts/commit/3a80b9fd009c8229d69f3f349acbfb19b7549a94) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add support for OpenAPI 3.1.1 to experimental parser

## 0.54.0

### Minor Changes

- [#1201](https://github.com/hey-api/openapi-ts/pull/1201) [`972a93a`](https://github.com/hey-api/openapi-ts/commit/972a93a91a945cc9ead73c08bb0fa9ee120433ba) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: make plugins first-class citizens

  This release makes plugins first-class citizens. In order to achieve that, the following breaking changes were introduced.

  ### Removed CLI options

  The `--types`, `--schemas`, and `--services` CLI options have been removed. You can list which plugins you'd like to use explicitly by passing a list of plugins as `--plugins <plugin1> <plugin2>`

  ### Removed `*.export` option

  Previously, you could explicitly disable export of certain artifacts using the `*.export` option or its shorthand variant. These were both removed. You can now disable export of specific artifacts by manually defining an array of `plugins` and excluding the unwanted plugin.

  ::: code-group

  ```js [shorthand]
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    schemas: false, // [!code --]
    plugins: ['@hey-api/types', '@hey-api/services'], // [!code ++]
  };
  ```

  ```js [*.export]
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    schemas: {
      export: false, // [!code --]
    },
    plugins: ['@hey-api/types', '@hey-api/services'], // [!code ++]
  };
  ```

  :::

  ### Renamed `schemas.name` option

  Each plugin definition contains a `name` field. This was conflicting with the `schemas.name` option. As a result, it has been renamed to `nameBuilder`.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    schemas: {
      name: (name) => `${name}Schema`, // [!code --]
    },
    plugins: [
      // ...other plugins
      {
        nameBuilder: (name) => `${name}Schema`, // [!code ++]
        name: '@hey-api/schemas',
      },
    ],
  };
  ```

  ### Removed `services.include` shorthand option

  Previously, you could use a string value as a shorthand for the `services.include` configuration option. You can now achieve the same result using the `include` option.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    services: '^MySchema', // [!code --]
    plugins: [
      // ...other plugins
      {
        include: '^MySchema', // [!code ++]
        name: '@hey-api/services',
      },
    ],
  };
  ```

  ### Renamed `services.name` option

  Each plugin definition contains a `name` field. This was conflicting with the `services.name` option. As a result, it has been renamed to `serviceNameBuilder`.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    services: {
      name: '{{name}}Service', // [!code --]
    },
    plugins: [
      // ...other plugins
      {
        serviceNameBuilder: '{{name}}Service', // [!code ++]
        name: '@hey-api/services',
      },
    ],
  };
  ```

  ### Renamed `types.dates` option

  Previously, you could set `types.dates` to a boolean or a string value, depending on whether you wanted to transform only type strings into dates, or runtime code too. Many people found these options confusing, so they have been simplified to a boolean and extracted into a separate `@hey-api/transformers` plugin.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    types: {
      dates: 'types+transform', // [!code --]
    },
    plugins: [
      // ...other plugins
      {
        dates: true, // [!code ++]
        name: '@hey-api/transformers',
      },
    ],
  };
  ```

  ### Removed `types.include` shorthand option

  Previously, you could use a string value as a shorthand for the `types.include` configuration option. You can now achieve the same result using the `include` option.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    types: '^MySchema', // [!code --]
    plugins: [
      // ...other plugins
      {
        include: '^MySchema', // [!code ++]
        name: '@hey-api/types',
      },
    ],
  };
  ```

  ### Renamed `types.name` option

  Each plugin definition contains a `name` field. This was conflicting with the `types.name` option. As a result, it has been renamed to `style`.

  ```js
  export default {
    client: '@hey-api/client-fetch',
    input: 'path/to/openapi.json',
    output: 'src/client',
    types: {
      name: 'PascalCase', // [!code --]
    },
    plugins: [
      // ...other plugins
      {
        name: '@hey-api/types',
        style: 'PascalCase', // [!code ++]
      },
    ],
  };
  ```

## 0.53.12

### Patch Changes

- [#1195](https://github.com/hey-api/openapi-ts/pull/1195) [`753643f`](https://github.com/hey-api/openapi-ts/commit/753643fae74d4248df8dc5fe9dda5f28a1dabdf1) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: TanStack Query plugin using missing import for infinite query

- [#1194](https://github.com/hey-api/openapi-ts/pull/1194) [`c38deaf`](https://github.com/hey-api/openapi-ts/commit/c38deaf02b606b92edd9c316b1444b6b6c12916d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: pass TanStack query signal to client call

## 0.53.11

### Patch Changes

- [#1151](https://github.com/hey-api/openapi-ts/pull/1151) [`587791d`](https://github.com/hey-api/openapi-ts/commit/587791dfede0167fbed229281467e4c4875936f5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update website domain, add license documentation

## 0.53.10

### Patch Changes

- [#1145](https://github.com/hey-api/openapi-ts/pull/1145) [`a0a5551`](https://github.com/hey-api/openapi-ts/commit/a0a55510d30a1a8dea0ade4908b5b13d51b5f9e6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update license field in package.json to match the license, revert client packages license to MIT

## 0.53.9

### Patch Changes

- [#1137](https://github.com/hey-api/openapi-ts/pull/1137) [`f4566c2`](https://github.com/hey-api/openapi-ts/commit/f4566c2bcd67f45f069bfa6220d3c710177f28cc) Thanks [@BierDav](https://github.com/BierDav)! - Add support for passing mutation specific options to `<operation_id>Mutation(options)`

## 0.53.8

### Patch Changes

- [#1123](https://github.com/hey-api/openapi-ts/pull/1123) [`032338c`](https://github.com/hey-api/openapi-ts/commit/032338c47506ccfd567bbbf915398942c8394bc2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: use correct relative path to bundled client when imported from nested module

## 0.53.7

### Patch Changes

- [#1113](https://github.com/hey-api/openapi-ts/pull/1113) [`dc696e0`](https://github.com/hey-api/openapi-ts/commit/dc696e0b4500dba5ceb4c772110b123bd2f71b40) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: skip nested properties in oneOf and anyOf compositions

- [#1115](https://github.com/hey-api/openapi-ts/pull/1115) [`5f077dd`](https://github.com/hey-api/openapi-ts/commit/5f077dd8d144bbfe71d8775bad5fe7ddda2315d6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: abstract page params logic in TanStack Query plugin

## 0.53.6

### Patch Changes

- [#1104](https://github.com/hey-api/openapi-ts/pull/1104) [`a1eada1`](https://github.com/hey-api/openapi-ts/commit/a1eada1896046f0de1710682635efc59434a1e2c) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export spec-compliant OpenAPI 3.1 interface

- [#1108](https://github.com/hey-api/openapi-ts/pull/1108) [`7677924`](https://github.com/hey-api/openapi-ts/commit/76779246534391deca5a371df2c7dc76e9d2eb73) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle multiple form-data parameters in Swagger 2.0

## 0.53.5

### Patch Changes

- [#1096](https://github.com/hey-api/openapi-ts/pull/1096) [`b6e350a`](https://github.com/hey-api/openapi-ts/commit/b6e350a9cc2d82ac4496b7d57ec8b58978c951c2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: make TanStack Query plugin work with class-based services

- [#1095](https://github.com/hey-api/openapi-ts/pull/1095) [`11ee53f`](https://github.com/hey-api/openapi-ts/commit/11ee53f4f519643ae7e3f0997ce4fe9b6cb050a8) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: avoid printing duplicate null nodes

- [#1094](https://github.com/hey-api/openapi-ts/pull/1094) [`713ccd5`](https://github.com/hey-api/openapi-ts/commit/713ccd5e5e250a14cacf96fd1dffad252cc4cc6a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: attach TanStack Query infinite page params only if they exist

## 0.53.4

### Patch Changes

- [#1087](https://github.com/hey-api/openapi-ts/pull/1087) [`b528236`](https://github.com/hey-api/openapi-ts/commit/b528236b626d12d4ac03b98b8abecc425291c5e5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: import handlebars instead of runtime

- [#1086](https://github.com/hey-api/openapi-ts/pull/1086) [`0bc1ebe`](https://github.com/hey-api/openapi-ts/commit/0bc1ebe318399d01296777746ce0bccc83c0e83d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: support dynamic require in child_process

## 0.53.3

### Patch Changes

- [#1075](https://github.com/hey-api/openapi-ts/pull/1075) [`11a276a`](https://github.com/hey-api/openapi-ts/commit/11a276a1e35dde0735363e892d8142016fd87eec) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: properly handle dual publishing and type generation

## 0.53.2

### Patch Changes

- [#1060](https://github.com/hey-api/openapi-ts/pull/1060) [`8d66c08`](https://github.com/hey-api/openapi-ts/commit/8d66c085cf81e0e166c3e172ce319d5e2d4002bf) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle colon in operation path

- [#1065](https://github.com/hey-api/openapi-ts/pull/1065) [`a756987`](https://github.com/hey-api/openapi-ts/commit/a756987ad396fd7e68cc5eff63f6615bffef3782) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: allow overriding generated headers from options

- [#1068](https://github.com/hey-api/openapi-ts/pull/1068) [`a48be86`](https://github.com/hey-api/openapi-ts/commit/a48be8660f6d1d84fdf25a3952587fb963482e8a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export Operation interface

- [#1067](https://github.com/hey-api/openapi-ts/pull/1067) [`5a52da1`](https://github.com/hey-api/openapi-ts/commit/5a52da1425abef9f4fef58ef077dbd05545e25a2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle named object property with no nested properties

- [#1066](https://github.com/hey-api/openapi-ts/pull/1066) [`e8a38ae`](https://github.com/hey-api/openapi-ts/commit/e8a38ae4e3f021a105d18764ef3252db7efa9aa0) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: transform any-of nullable dates

## 0.53.1

### Patch Changes

- [#1050](https://github.com/hey-api/openapi-ts/pull/1050) [`6922b5a`](https://github.com/hey-api/openapi-ts/commit/6922b5a3ebe67190d2034ea79674706a5e80e818) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: throw error on invalid client value

## 0.53.0

### Minor Changes

- [#1008](https://github.com/hey-api/openapi-ts/pull/1008) [`dc4a40d`](https://github.com/hey-api/openapi-ts/commit/dc4a40d517853e4cf5be532f5bf4874c84c924be) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: rename legacy clients with 'legacy/' prefix

- [#1009](https://github.com/hey-api/openapi-ts/pull/1009) [`c6b044d`](https://github.com/hey-api/openapi-ts/commit/c6b044d0bc9dc54cb0eb58d23438f4e1d050cb38) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: change schemas name pattern, add schemas.name option

### Patch Changes

- [#989](https://github.com/hey-api/openapi-ts/pull/989) [`bc78a42`](https://github.com/hey-api/openapi-ts/commit/bc78a421eafed1920102b796842e227cacda6ef0) Thanks [@jacobinu](https://github.com/jacobinu)! - fix: make UserConfig interface instead of type

- [#1010](https://github.com/hey-api/openapi-ts/pull/1010) [`b6e58c6`](https://github.com/hey-api/openapi-ts/commit/b6e58c64d1b71897533a85d1738cd7ce7ede178d) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: set query key base url from supplied client if provided

## 0.52.11

### Patch Changes

- [#981](https://github.com/hey-api/openapi-ts/pull/981) [`afd8c43`](https://github.com/hey-api/openapi-ts/commit/afd8c4386fb7b2f86a54e73c9471945bdfad22ea) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: export query key functions from TanStack Query plugin

## 0.52.10

### Patch Changes

- [#973](https://github.com/hey-api/openapi-ts/pull/973) [`8f7a14f`](https://github.com/hey-api/openapi-ts/commit/8f7a14f570e2d17053f1e612f6e045df774916f1) Thanks [@jacobinu](https://github.com/jacobinu)! - fix: handle tree-shakeable angular client case

## 0.52.9

### Patch Changes

- [#948](https://github.com/hey-api/openapi-ts/pull/948) [`ebfd6ee`](https://github.com/hey-api/openapi-ts/commit/ebfd6eec434d7b84883a8f9058f31948fb1a40f2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle schemas with generics from C#

- [#949](https://github.com/hey-api/openapi-ts/pull/949) [`16f8956`](https://github.com/hey-api/openapi-ts/commit/16f89566a7affeb09a6b928c43cfa2733e8b9adc) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: rename infinite key in query key to \_infinite

- [#946](https://github.com/hey-api/openapi-ts/pull/946) [`f873fa6`](https://github.com/hey-api/openapi-ts/commit/f873fa67befe60b2fd8f63bc2c8b73437591f686) Thanks [@mrlubos](https://github.com/mrlubos)! - chore: warn on duplicate operation ID

- [#947](https://github.com/hey-api/openapi-ts/pull/947) [`7f0fefe`](https://github.com/hey-api/openapi-ts/commit/7f0fefec92b25ce18ed0d1c6a6edf1adbc7d4481) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly use parentheses around composed schemas

- [#944](https://github.com/hey-api/openapi-ts/pull/944) [`2f7cc89`](https://github.com/hey-api/openapi-ts/commit/2f7cc8986c0644b41cc6a5526ddf52ebff880c79) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly handle integer type in additional properties

## 0.52.8

### Patch Changes

- [#932](https://github.com/hey-api/openapi-ts/pull/932) [`cdf01e8`](https://github.com/hey-api/openapi-ts/commit/cdf01e8cc0dc63213465b9e8fe33b80443d36f55) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: cherry pick keys in mutation page param type

## 0.52.7

### Patch Changes

- [#929](https://github.com/hey-api/openapi-ts/pull/929) [`b56c81c`](https://github.com/hey-api/openapi-ts/commit/b56c81ca67a2d069b33430c3139e2135a299b309) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle various issues with additionalProperties definitions

- [#927](https://github.com/hey-api/openapi-ts/pull/927) [`65f151d`](https://github.com/hey-api/openapi-ts/commit/65f151dc0004ce817bc370486495bdd281439e55) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update TanStack Query key to contain base URL

- [#927](https://github.com/hey-api/openapi-ts/pull/927) [`65f151d`](https://github.com/hey-api/openapi-ts/commit/65f151dc0004ce817bc370486495bdd281439e55) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: change TanStack Query mutation helpers to functions for consistent API

## 0.52.6

### Patch Changes

- [#920](https://github.com/hey-api/openapi-ts/pull/920) [`4ff2404`](https://github.com/hey-api/openapi-ts/commit/4ff24049457b7d0d5333c3704f488f1f45dd0c5b) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add preview version of TanStack Query plugin

## 0.52.5

### Patch Changes

- [#910](https://github.com/hey-api/openapi-ts/pull/910) [`428dcad`](https://github.com/hey-api/openapi-ts/commit/428dcad06eba3ab14876c28092a6df81fcde7dbe) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: throw if prerequisite checks are not met

- [#907](https://github.com/hey-api/openapi-ts/pull/907) [`a2a1ab8`](https://github.com/hey-api/openapi-ts/commit/a2a1ab8bd78c2cbbdcb7adb2ba3815250843dbe7) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly transform string to pascalcase when referenced inside schema

- [#908](https://github.com/hey-api/openapi-ts/pull/908) [`225b640`](https://github.com/hey-api/openapi-ts/commit/225b640b5ac628cb7ba3b7afb39ff271a0608055) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: do not generate types tree by default if services are enabled as it is unused

## 0.52.4

### Patch Changes

- [#895](https://github.com/hey-api/openapi-ts/pull/895) [`44de8d8`](https://github.com/hey-api/openapi-ts/commit/44de8d89556b3abf48acc4e23c9b9c198059c757) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: define ThrowOnError generic as the last argument

## 0.52.3

### Patch Changes

- [#884](https://github.com/hey-api/openapi-ts/pull/884) [`62a39e6`](https://github.com/hey-api/openapi-ts/commit/62a39e63f645bce0801779fb6b90531401748e86) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: generate ThrowOnError generic for class-based client methods

## 0.52.2

### Patch Changes

- [#881](https://github.com/hey-api/openapi-ts/pull/881) [`a9ddfe6`](https://github.com/hey-api/openapi-ts/commit/a9ddfe6c4487fe5debd04a194ee6c6b6c611dc6b) Thanks [@hougesen](https://github.com/hougesen)! - fix: check if key is schema property before removing

## 0.52.1

### Patch Changes

- [#855](https://github.com/hey-api/openapi-ts/pull/855) [`7ac6274`](https://github.com/hey-api/openapi-ts/commit/7ac627463a15fa6be2c9d103b25200355df6b166) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: define multiple errors type as union instead of intersection

- [#853](https://github.com/hey-api/openapi-ts/pull/853) [`6ab387d`](https://github.com/hey-api/openapi-ts/commit/6ab387d3440ec5ec524e7f198aedfa6734431d76) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: remove Content-Type header with multipart/form-data content type

- [#861](https://github.com/hey-api/openapi-ts/pull/861) [`21ccf90`](https://github.com/hey-api/openapi-ts/commit/21ccf90b864590c211fbfa3de5c687dd3c48f897) Thanks [@qqilihq](https://github.com/qqilihq)! - fix: Additional properties key

- [#869](https://github.com/hey-api/openapi-ts/pull/869) [`42d8a41`](https://github.com/hey-api/openapi-ts/commit/42d8a4151bace7b70af60a1abe46b7550ddad686) Thanks [@SamuelGuillemet](https://github.com/SamuelGuillemet)! - fix: add conditionnal generation for service related types

## 0.52.0

### Minor Changes

- [#835](https://github.com/hey-api/openapi-ts/pull/835) [`7ab277b`](https://github.com/hey-api/openapi-ts/commit/7ab277b22467fe268719af817aee701d6be3e828) Thanks [@LeeChSien](https://github.com/LeeChSien)! - feat: add namespace supporting for enums

### Patch Changes

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`babf11a`](https://github.com/hey-api/openapi-ts/commit/babf11ae082af642ac71cfee9c523cc976132a50) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: generate internal client for services when using standalone package

## 0.51.0

### Minor Changes

- [#828](https://github.com/hey-api/openapi-ts/pull/828) [`82a4696`](https://github.com/hey-api/openapi-ts/commit/82a4696b0b209ea2d9147f47f213479e61aed3d7) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: make `client` config option required

### Patch Changes

- [#823](https://github.com/hey-api/openapi-ts/pull/823) [`23c9dcd`](https://github.com/hey-api/openapi-ts/commit/23c9dcd5de19de62d745cc539674c815b2588cd2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: correctly process body parameter for OpenAPI 2.0 specs

- [#827](https://github.com/hey-api/openapi-ts/pull/827) [`8d81c06`](https://github.com/hey-api/openapi-ts/commit/8d81c0605dbf4b4d19ec1c2dc51a93f8a2aca5b2) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: do not ignore api-version param in standalone clients

## 0.50.2

### Patch Changes

- [#818](https://github.com/hey-api/openapi-ts/pull/818) [`85d123c`](https://github.com/hey-api/openapi-ts/commit/85d123c9160f4ecb4c48e8a2ead54abf604dd21b) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle fully illegal schema names

## 0.50.1

### Patch Changes

- [#807](https://github.com/hey-api/openapi-ts/pull/807) [`ef249ba`](https://github.com/hey-api/openapi-ts/commit/ef249ba5bd04dbfb0e0a497caaa021f9c7de6949) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: generate types only for filtered services

- [#807](https://github.com/hey-api/openapi-ts/pull/807) [`ef249ba`](https://github.com/hey-api/openapi-ts/commit/ef249ba5bd04dbfb0e0a497caaa021f9c7de6949) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: allow any key/value pair in object types with empty properties object

## 0.50.0

### Minor Changes

- [#790](https://github.com/hey-api/openapi-ts/pull/790) [`68c3921`](https://github.com/hey-api/openapi-ts/commit/68c3921fd6e9a5db41ebd9f06e4f3ef6e64ab051) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: allow bundling standalone clients with `client.bundle = true`

## 0.49.0

### Minor Changes

- [#787](https://github.com/hey-api/openapi-ts/pull/787) [`327c5fb`](https://github.com/hey-api/openapi-ts/commit/327c5fb629f0c7b9c727da87b6bc287b8e98bcd5) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: allow filtering service endpoints with `services.filter`

### Patch Changes

- [#784](https://github.com/hey-api/openapi-ts/pull/784) [`f12dccf`](https://github.com/hey-api/openapi-ts/commit/f12dccf0ae3a05badb5783354bcd093f18f3ab74) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: suffix illegal service names

- [#786](https://github.com/hey-api/openapi-ts/pull/786) [`20759e2`](https://github.com/hey-api/openapi-ts/commit/20759e2cc52d78974fc0f78f581e9d9cb2d21ca5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle references to schemas with illegal names

- [#788](https://github.com/hey-api/openapi-ts/pull/788) [`ecd94f2`](https://github.com/hey-api/openapi-ts/commit/ecd94f2adab1dbe10e7a9c310d1fb6d1f170d332) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle application/x-www-form-urlencoded content in request body

## 0.48.3

### Patch Changes

- [#781](https://github.com/hey-api/openapi-ts/pull/781) [`df3b799`](https://github.com/hey-api/openapi-ts/commit/df3b79996d47a69e4f2fdad93cea18ae1a01c419) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: use methodNameBuilder when asClass is false

- [#782](https://github.com/hey-api/openapi-ts/pull/782) [`edfd2bd`](https://github.com/hey-api/openapi-ts/commit/edfd2bdbb64f6682ded16f6da30f88f1c113bbe0) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: allow not generating types tree with types.tree = false

## 0.48.2

### Patch Changes

- [#746](https://github.com/hey-api/openapi-ts/pull/746) [`0448823`](https://github.com/hey-api/openapi-ts/commit/044882399d56d1532c7125df2e69cfb3b5fb4f34) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle formData parameters in generated types

- [#742](https://github.com/hey-api/openapi-ts/pull/742) [`efc30f4`](https://github.com/hey-api/openapi-ts/commit/efc30f4a2327b165b62f8467c68351a8bf94ffe5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: ignore services.asClass setting for named clients

- [#744](https://github.com/hey-api/openapi-ts/pull/744) [`1e9edde`](https://github.com/hey-api/openapi-ts/commit/1e9edde54abd8978405f91b821c99b97f067d566) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: improve default response type detection

- [#745](https://github.com/hey-api/openapi-ts/pull/745) [`342772a`](https://github.com/hey-api/openapi-ts/commit/342772a560378c6718d25c29871eeab9a72c62a6) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle properties in one-of composition

## 0.48.1

### Patch Changes

- [#734](https://github.com/hey-api/openapi-ts/pull/734) [`1f52b26`](https://github.com/hey-api/openapi-ts/commit/1f52b260807531edb2c14003473ea4907007ecdb) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: generate service types when types are enabled, even if services are disabled

- [#737](https://github.com/hey-api/openapi-ts/pull/737) [`0537fe8`](https://github.com/hey-api/openapi-ts/commit/0537fe8682a93cc95d7637d643db4b9780318ea1) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: support custom config file path

- [#736](https://github.com/hey-api/openapi-ts/pull/736) [`8410046`](https://github.com/hey-api/openapi-ts/commit/8410046c45d25db48ba940a0c6c7a7cda9e86b6a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle async response transformers

## 0.48.0

### Minor Changes

- [#696](https://github.com/hey-api/openapi-ts/pull/696) [`917405f`](https://github.com/hey-api/openapi-ts/commit/917405fcdcb2e978df693eb51720afa6fcf914e2) Thanks [@anchan828](https://github.com/anchan828)! - feat: pass the Operation object to methodNameBuilder

### Patch Changes

- [#708](https://github.com/hey-api/openapi-ts/pull/708) [`36cf95d`](https://github.com/hey-api/openapi-ts/commit/36cf95d319b175149d3b3ecc382b8d739186e658) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: make getHeaders() accept generic

- [#712](https://github.com/hey-api/openapi-ts/pull/712) [`6a5b96b`](https://github.com/hey-api/openapi-ts/commit/6a5b96b59e4248f2acaf5422be262edde97427dd) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle void responses in transformers

## 0.47.2

### Patch Changes

- [#701](https://github.com/hey-api/openapi-ts/pull/701) [`1081bbf`](https://github.com/hey-api/openapi-ts/commit/1081bbf5082450c18547dac4737ecc0e312cdd0e) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add initial implementation of prefixItems

## 0.47.1

### Patch Changes

- [#690](https://github.com/hey-api/openapi-ts/pull/690) [`1017ace`](https://github.com/hey-api/openapi-ts/commit/1017acee80630d84a08bd8f0087c8fb0de270f1a) Thanks [@Nick-Lucas](https://github.com/Nick-Lucas)! - Fix an issue where transforms for endpoints with array returns were not generated correctly

## 0.47.0

### Minor Changes

- [#685](https://github.com/hey-api/openapi-ts/pull/685) [`8ca3e5e`](https://github.com/hey-api/openapi-ts/commit/8ca3e5e2990bc07ce0bac902245d08b67b6621e8) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add initial support for response transformers (string -> Date)

- [#663](https://github.com/hey-api/openapi-ts/pull/663) [`e01c612`](https://github.com/hey-api/openapi-ts/commit/e01c61213e266afad5e3b159682b05957aac6534) Thanks [@Stono](https://github.com/Stono)! - Add support for customizing method names with `services.methodNameBuilder()`

## 0.46.3

### Patch Changes

- [#594](https://github.com/hey-api/openapi-ts/pull/594) [`9878381`](https://github.com/hey-api/openapi-ts/commit/98783811e0c90705ddac2cc5e54c524aae634865) Thanks [@SimenB](https://github.com/SimenB)! - Add explicit type annotations to `Interceptors`

  This allows the generated code to work with TypeScript 5.5's new `isolatedDeclarations` configuration.

- [#635](https://github.com/hey-api/openapi-ts/pull/635) [`0b09940`](https://github.com/hey-api/openapi-ts/commit/0b0994050dbcb6c17e8b78ca1c77738fc8e0d498) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: handle 1XX response status codes

- [#636](https://github.com/hey-api/openapi-ts/pull/636) [`498f459`](https://github.com/hey-api/openapi-ts/commit/498f45979b91bf93b319413c60492af94a08df48) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: improve default response status code classification

## 0.46.2

### Patch Changes

- fix: do not transform property names for standalone clients ([#616](https://github.com/hey-api/openapi-ts/pull/616))

## 0.46.1

### Patch Changes

- fix: handle application/json content type in parameter definitions ([#614](https://github.com/hey-api/openapi-ts/pull/614))

## 0.46.0

### Minor Changes

- feat: tree-shakeable services ([#602](https://github.com/hey-api/openapi-ts/pull/602))

## 0.45.1

### Patch Changes

- fix: use generated types in request object instead of inlined duplicated params ([#582](https://github.com/hey-api/openapi-ts/pull/582))

## 0.45.0

### Minor Changes

- feat: remove client inference ([#569](https://github.com/hey-api/openapi-ts/pull/569))

### Patch Changes

- fix: deduplicate inlined enums ([#573](https://github.com/hey-api/openapi-ts/pull/573))

- fix: generate correct optional key in types when using positional arguments (useOptions: false) ([#572](https://github.com/hey-api/openapi-ts/pull/572))

## 0.44.0

### Minor Changes

- feat: move format and lint config options to output object ([#546](https://github.com/hey-api/openapi-ts/pull/546))

### Patch Changes

- fix: comment position in JavaScript enums ([#544](https://github.com/hey-api/openapi-ts/pull/544))

- fix: export inlined enums from components ([#563](https://github.com/hey-api/openapi-ts/pull/563))

- fix: remove unused enums option from CLI ([#565](https://github.com/hey-api/openapi-ts/pull/565))

- fix: Support typescript in peerDependencies ([#551](https://github.com/hey-api/openapi-ts/pull/551))

## 0.43.2

### Patch Changes

- fix: deduplicate exported data and response types ([#538](https://github.com/hey-api/openapi-ts/pull/538))

## 0.43.1

### Patch Changes

- fix: use optional chaining in bin catch block ([#528](https://github.com/hey-api/openapi-ts/pull/528))

- fix: broken encoding ([#532](https://github.com/hey-api/openapi-ts/pull/532))

- fix(parser): handle type array ([#533](https://github.com/hey-api/openapi-ts/pull/533))

## 0.43.0

### Minor Changes

- feat: remove enum postfix, use typescript enums in types when generated, export enums from types.gen.ts ([#498](https://github.com/hey-api/openapi-ts/pull/498))

### Patch Changes

- fix: negative numbers in numeric enums ([#470](https://github.com/hey-api/openapi-ts/pull/470))

- fix: escape keys in schemas starting with digit but containing non-digit characters ([#502](https://github.com/hey-api/openapi-ts/pull/502))

- fix: issue causing code to not generate (t.filter is not a function) ([#507](https://github.com/hey-api/openapi-ts/pull/507))

- fix: handle additional properties union ([#499](https://github.com/hey-api/openapi-ts/pull/499))

- fix: do not export inline enums ([#508](https://github.com/hey-api/openapi-ts/pull/508))

- fix: prefix parameter type exports to avoid conflicts ([#501](https://github.com/hey-api/openapi-ts/pull/501))

- fix: export operation data and response types ([#500](https://github.com/hey-api/openapi-ts/pull/500))

- fix: handle cases where packages are installed globally ([#471](https://github.com/hey-api/openapi-ts/pull/471))

- fix: handle cases where package.json does not exist ([#471](https://github.com/hey-api/openapi-ts/pull/471))

## 0.42.1

### Patch Changes

- fix: properly set formData and body when using options ([#461](https://github.com/hey-api/openapi-ts/pull/461))

## 0.42.0

### Minor Changes

- change: config option `lint: true` has changed to `lint: 'eslint'` ([#455](https://github.com/hey-api/openapi-ts/pull/455))

- change: disable formatting with prettier by default ([#457](https://github.com/hey-api/openapi-ts/pull/457))

- feat: add support for biomejs as a formatter ([#455](https://github.com/hey-api/openapi-ts/pull/455))

- feat: move operationId config option to services object ([#441](https://github.com/hey-api/openapi-ts/pull/441))

- feat: add operation error type mappings ([#442](https://github.com/hey-api/openapi-ts/pull/442))

- feat: add support for biomejs as a linter ([#455](https://github.com/hey-api/openapi-ts/pull/455))

- change: config option `format: true` has changed to `format: 'prettier'` ([#455](https://github.com/hey-api/openapi-ts/pull/455))

### Patch Changes

- fix: do not destructure data when using use options ([#450](https://github.com/hey-api/openapi-ts/pull/450))

- feat: automatically handle dates in query string ([#443](https://github.com/hey-api/openapi-ts/pull/443))

- fix: only remove core directory when export core is true ([#449](https://github.com/hey-api/openapi-ts/pull/449))

- fix: add jsdoc comments with use options ([#439](https://github.com/hey-api/openapi-ts/pull/439))

## 0.41.0

### Minor Changes

- feat: add form type option for schemas ([#433](https://github.com/hey-api/openapi-ts/pull/433))

- feat: replace useDateType with option in types object ([#435](https://github.com/hey-api/openapi-ts/pull/435))

- feat: replace serviceResponse with option in services object ([#434](https://github.com/hey-api/openapi-ts/pull/434))

- feat: replace postfixServices with configuration object ([#430](https://github.com/hey-api/openapi-ts/pull/430))

### Patch Changes

- fix: properly escape backticks in template literals ([#431](https://github.com/hey-api/openapi-ts/pull/431))

- fix: transform names of referenced types ([#422](https://github.com/hey-api/openapi-ts/pull/422))

- fix: use config interceptors passed to constructor when using named client ([#432](https://github.com/hey-api/openapi-ts/pull/432))

- fix: properly escape expressions in template literals ([#431](https://github.com/hey-api/openapi-ts/pull/431))

- fix: do not export common properties as schemas ([#424](https://github.com/hey-api/openapi-ts/pull/424))

## 0.40.2

### Patch Changes

- fix: unhandled SyntaxKind unknown when specification has numeric enums ([#417](https://github.com/hey-api/openapi-ts/pull/417))

## 0.40.1

### Patch Changes

- fix: revert to generating commonjs for esm and commonjs support ([#409](https://github.com/hey-api/openapi-ts/pull/409))

## 0.40.0

### Minor Changes

- feat: allow choosing naming convention for types ([#402](https://github.com/hey-api/openapi-ts/pull/402))

### Patch Changes

- fix: rename exportModels to types ([#402](https://github.com/hey-api/openapi-ts/pull/402))

- fix: rename models.gen.ts to types.gen.ts ([#399](https://github.com/hey-api/openapi-ts/pull/399))

- fix: export enums from index.ts ([#399](https://github.com/hey-api/openapi-ts/pull/399))

## 0.39.0

### Minor Changes

- feat: rename generated files ([#363](https://github.com/hey-api/openapi-ts/pull/363))

- feat: add JSON-LD to content parsing ([#390](https://github.com/hey-api/openapi-ts/pull/390))

- fix: generate enums into their own file ([#358](https://github.com/hey-api/openapi-ts/pull/358))

### Patch Changes

- fix: remove file if no contents to write to it ([#373](https://github.com/hey-api/openapi-ts/pull/373))

- fix: eslint properly fixes output ([#375](https://github.com/hey-api/openapi-ts/pull/375))

- fix: invalid typescript Record generated with circular dependencies ([#374](https://github.com/hey-api/openapi-ts/pull/374))

- fix: prefer unknown type over any ([#392](https://github.com/hey-api/openapi-ts/pull/392))

- fix: only delete generated files instead of whole output directory ([#362](https://github.com/hey-api/openapi-ts/pull/362))

- fix: handle decoding models with `%` in description ([#360](https://github.com/hey-api/openapi-ts/pull/360))

- fix: throw error when typescript is missing ([#366](https://github.com/hey-api/openapi-ts/pull/366))

## 0.38.1

### Patch Changes

- fix: inconsistent indentation in models file when not using `format: true` ([#349](https://github.com/hey-api/openapi-ts/pull/349))

- fix: output path no longer required to be within cwd ([#353](https://github.com/hey-api/openapi-ts/pull/353))

## 0.38.0

### Minor Changes

- fix: rename write to dryRun and invert value ([#326](https://github.com/hey-api/openapi-ts/pull/326))

### Patch Changes

- fix: generate constant size array types properly ([#345](https://github.com/hey-api/openapi-ts/pull/345))

- fix: support x-enumNames for custom enum names ([#334](https://github.com/hey-api/openapi-ts/pull/334))

- fix: export service types from single namespace ([#341](https://github.com/hey-api/openapi-ts/pull/341))

- fix: generate models with proper indentation when formatting is false ([#340](https://github.com/hey-api/openapi-ts/pull/340))

- fix: log errors to file ([#329](https://github.com/hey-api/openapi-ts/pull/329))

- fix: cleanup some styling issues when generating client without formatting ([#330](https://github.com/hey-api/openapi-ts/pull/330))

## 0.37.3

### Patch Changes

- fix: do not ignore additionalProperties when object with properties object ([#323](https://github.com/hey-api/openapi-ts/pull/323))

## 0.37.2

### Patch Changes

- fix: escape schema names ([#317](https://github.com/hey-api/openapi-ts/pull/317))

- fix: escape backticks in strings starting with backtick ([#315](https://github.com/hey-api/openapi-ts/pull/315))

## 0.37.1

### Patch Changes

- fix: ensure strings with both single/double quotes and backticks are escaped properly ([#310](https://github.com/hey-api/openapi-ts/pull/310)) ([#310](https://github.com/hey-api/openapi-ts/pull/310))

## 0.37.0

### Minor Changes

- remove: `generics` as valid option for serviceResponse ([#299](https://github.com/hey-api/openapi-ts/pull/299))

### Patch Changes

- fix: escape dollar sign in operation names ([#307](https://github.com/hey-api/openapi-ts/pull/307))

## 0.36.2

### Patch Changes

- fix: move service types into models file ([#292](https://github.com/hey-api/openapi-ts/pull/292))

## 0.36.1

### Patch Changes

- fix: do not throw when failing to decode URI ([#296](https://github.com/hey-api/openapi-ts/pull/296))

## 0.36.0

### Minor Changes

- feat: export schemas directly from OpenAPI specification (ie. support exporting JSON schemas draft 2020-12 ([#285](https://github.com/hey-api/openapi-ts/pull/285))

### Patch Changes

- fix(config): rename exportSchemas to schemas ([#288](https://github.com/hey-api/openapi-ts/pull/288))

## 0.35.0

### Minor Changes

- fix(config): remove postfixModels option ([#266](https://github.com/hey-api/openapi-ts/pull/266))

- fix(client): do not send default params ([#267](https://github.com/hey-api/openapi-ts/pull/267))

### Patch Changes

- fix(api): use TypeScript Compiler API to create schemas ([#271](https://github.com/hey-api/openapi-ts/pull/271))

- fix(client): export APIResult when using serviceResponse as 'response' ([#283](https://github.com/hey-api/openapi-ts/pull/283))

- fix(parser): use only isRequired to determine if field is required ([#264](https://github.com/hey-api/openapi-ts/pull/264))

## 0.34.5

### Patch Changes

- fix(client): access service data type in namespace properly ([#258](https://github.com/hey-api/openapi-ts/pull/258))

## 0.34.4

### Patch Changes

- fix(client): namespace service data types ([#246](https://github.com/hey-api/openapi-ts/pull/246))

## 0.34.3

### Patch Changes

- fix(docs): link to docs hosted on vercel ([#244](https://github.com/hey-api/openapi-ts/pull/244))

## 0.34.2

### Patch Changes

- docs(readme): update broken contributing link ([#236](https://github.com/hey-api/openapi-ts/pull/236))

- fix(config): support ts config files and `defineConfig` syntax ([`0c92222ab74bb7d2391d49587760db9ea9228d5a`](https://github.com/hey-api/openapi-ts/commit/0c92222ab74bb7d2391d49587760db9ea9228d5a))

## 0.34.1

### Patch Changes

- fix(docs): ensure README is shown on NPMJS ([#229](https://github.com/hey-api/openapi-ts/pull/229))

## 0.34.0

### Minor Changes

- feat(client): generate all services in single `services.ts` file ([#215](https://github.com/hey-api/openapi-ts/pull/215))

- feat(schema): add support for default values ([#197](https://github.com/hey-api/openapi-ts/pull/197))

- feat(schema): add array of enum values for enums ([#197](https://github.com/hey-api/openapi-ts/pull/197))

### Patch Changes

- fix(axios): use builtin form data to ensure blob form data works in node environment ([#211](https://github.com/hey-api/openapi-ts/pull/211))

- fix(enum): append index number on duplicate name ([#220](https://github.com/hey-api/openapi-ts/pull/220))

## 0.33.2

### Patch Changes

- fix(axios): properly type content-type headers assignment ([#206](https://github.com/hey-api/openapi-ts/pull/206))

## 0.33.1

### Patch Changes

- fix(axios): set content type to multipart/form-data when using form data ([#204](https://github.com/hey-api/openapi-ts/pull/204))

## 0.33.0

### Minor Changes

- feat(fetch): detect form data repsonses properly ([#195](https://github.com/hey-api/openapi-ts/pull/195))

- feat(fetch): add application/octet-stream, application/pdf, and application/zip as binary response types ([#195](https://github.com/hey-api/openapi-ts/pull/195))

### Patch Changes

- fix(client): do not create or export empty files ([#200](https://github.com/hey-api/openapi-ts/pull/200))

- client(angular/fetch/xhr): detect all application/json or +json as JSON ([#195](https://github.com/hey-api/openapi-ts/pull/195))

## 0.32.1

### Patch Changes

- fix(schema): allow minimums/maximums to be 0 ([#194](https://github.com/hey-api/openapi-ts/pull/194))

- fix(axios): let axios handle serializing form data ([#192](https://github.com/hey-api/openapi-ts/pull/192))

## 0.32.0

### Minor Changes

- Support all HTTP error codes ([#188](https://github.com/hey-api/openapi-ts/pull/188))

- Use File or Blob type for binary types ([#186](https://github.com/hey-api/openapi-ts/pull/186))

- Check value instanceof Blob when using isBlob ([#186](https://github.com/hey-api/openapi-ts/pull/186))

### Patch Changes

- fix(cli): properly handle booleans ([#190](https://github.com/hey-api/openapi-ts/pull/190))

- Attempt to use body type as content type when sending Blob in node client ([#185](https://github.com/hey-api/openapi-ts/pull/185))

- fix(api): add experimental flag ([#191](https://github.com/hey-api/openapi-ts/pull/191))

## 0.31.1

### Patch Changes

- merge enums and useLegacyEnums into one option ([#178](https://github.com/hey-api/openapi-ts/pull/178))

- use FormData from node-fetch in node client ([#173](https://github.com/hey-api/openapi-ts/pull/173))

## 0.31.0

### Minor Changes

- Import all required models for a service in one import ([#172](https://github.com/hey-api/openapi-ts/pull/172))

- generate all models in single `models.ts` file ([#168](https://github.com/hey-api/openapi-ts/pull/168))

- generate all schemas in single `schemas.ts` file ([#168](https://github.com/hey-api/openapi-ts/pull/168))

### Patch Changes

- fix async response interceptors when using angular client ([#167](https://github.com/hey-api/openapi-ts/pull/167))

- fix deprecation warning on `throwError` in Angular client ([#167](https://github.com/hey-api/openapi-ts/pull/167))

- Do not create or export CancelablePromise when using Angular client ([#167](https://github.com/hey-api/openapi-ts/pull/167))

- Fix issue causing type error when targeting lower than ES2015 ([#171](https://github.com/hey-api/openapi-ts/pull/171))

- fix various warnings in generated client code ([#164](https://github.com/hey-api/openapi-ts/pull/164))

- fix providing interceptors in Angular client ([#167](https://github.com/hey-api/openapi-ts/pull/167))

## 0.30.0

### Minor Changes

- add support for interceptors ([#153](https://github.com/hey-api/openapi-ts/pull/153))

## 0.29.2

### Patch Changes

- Fix export types as type only when using useLegacyEnums ([#160](https://github.com/hey-api/openapi-ts/pull/160))

## 0.29.1

### Patch Changes

- Properly export enums when using useLegacyEnums ([#158](https://github.com/hey-api/openapi-ts/pull/158))

## 0.29.0

### Minor Changes

- Add useLegacyEnums options to generate TypeScript enums ([#147](https://github.com/hey-api/openapi-ts/pull/147))

## 0.28.0

### Minor Changes

- Add `index.ts` file to models, schemas, and services ([#137](https://github.com/hey-api/openapi-ts/pull/137))

## 0.27.39

### Patch Changes

- Warn users about missing dependencies used in the generated client ([#124](https://github.com/hey-api/openapi-ts/pull/124))

- Use AbortController in Axios client instead of deprecated CancelToken ([#124](https://github.com/hey-api/openapi-ts/pull/124))

## 0.27.38

### Minor Changes

- Make useOptions default to true

## 0.27.37

### Minor Changes

- Fix import error in generated Node client

- Update package dependencies

- Use engine-strict in .npmrc

## 0.27.36

### Minor Changes

- Handle falsy values in header

- Export schemas by default

## 0.27.35

### Minor Changes

- Update all project dependencies

- Discard only null or undefined in query string

## 0.27.34

### Minor Changes

- Add flag for linting generated code (default: false)

- Add flag for formatting generated code (default: true)

## 0.27.33

### Minor Changes

- Auto format with Eslint if available

- Add types for programmatic API

## 0.27.32

### Minor Changes

- Rename Config type to UserConfig

- Pass arguments in correct order in Angular client

## 0.27.31

### Minor Changes

- Add support for openapi-ts.config.js file

- Use built-in flat map

## 0.27.30

### Minor Changes

- Prefer unknown instead of any in generated client

## 0.27.29

### Minor Changes

- Rename openapi command to openapi-ts

- Add basic support for response that are Blobs

## 0.27.28

### Minor Changes

- Generate enums as JavaScript objects

- Use shorthand object properties in service calls

## 0.27.27

### Minor Changes

- Handle cases where a project does not have dependencies when checking to run Prettier

## 0.27.26

### Minor Changes

- Skip global parameters if they are duplicates of path parameters

- remove option to indent code

## 0.27.25

### Minor Changes

- Correctly set content-type header, even when body is falsy

## 0.27.24

### Minor Changes

- Remove union types flag (this is now default)

## 0.27.23

### Minor Changes

- Support printing exact arrays

## 0.27.22

### Minor Changes

- Add option to specify custom base path

- Fix spacing in cancelable promise

## 0.27.21

### Minor Changes

- Add explicit flags for generics

## 0.27.20

### Minor Changes

- Do not require type to be set for object properties

## 0.27.19

### Minor Changes

- Do not insert generics into custom client

## 0.27.18

### Minor Changes

- Support returning raw result object

- Allow passing config

## 0.27.17

### Minor Changes

- Generate nullable interface when isNullable is true

## 0.27.16

### Minor Changes

- Generate types for services when useOptions is true

## 0.27.15

### Minor Changes

- Fix wrong path on Windows

## 0.27.14

### Minor Changes

- Change imports to match project style

## 0.27.13

### Minor Changes

- Support printing Date instead of string for date-time formats in models

## 0.27.12

### Minor Changes

- Escape enum name when exported

## 0.27.11

### Minor Changes

- Fix typo in template header

## 0.27.10

### Minor Changes

- Escape newlines when outputting pattern string value in schemas

## 0.27.9

### Minor Changes

- Start passing options object instead of positional parameters

- Handle composition of any-of and properties

- Allow ignoring operation ID when generating operation names

- Propagate useVersionId to Swagger V2 parser

- Change --ingoreOperationId to --useOperationId

## 0.27.8

### Minor Changes

- Support non-ascii (unicode) characters in service name, operation name, and parameter name

## 0.27.7

### Minor Changes

- Bump dependencies

## 0.27.6

### Minor Changes

- Allow overriding request body name with x-body-name key

## 0.27.5

### Minor Changes

- Type additional properties with properties

- Parse array items only if parent definition has type

## 0.27.4

### Minor Changes

- Bump dependencies

## 0.27.3

### Minor Changes

- Support autoformat option flag

- Handle more cases of any-of

- Support regexp to select models to export

- Return optional success response on 204 status code

- Fix nested any-of

- Add const support

## 0.27.0

### Minor Changes

- Reverted `@apidevtools/json-schema-ref-parser` to version 10.1.0

## 0.26.0

### Minor Changes

- Upgraded dependencies

## 0.25.0

### Minor Changes

- Upgraded dependencies
- Allow usage of a custom axios instance
- Added message in generated files

## 0.24.0

### Minor Changes

- Upgraded dependencies
- Fixed issue with Cancelable promise
- Fixed issue with escaping reserved keywords in schema names
- Added `--postfixModels` option

## 0.23.0

### Minor Changes

- Upgraded dependencies
- Added blank line at the end of generated files
- Added support for Node.js v12
- Added `request` property inside `ApiError`
- Added support for `@depricated` inside models and operations

## 0.22.0

### Minor Changes

- Upgraded dependencies
- Fixed issue with `null` value inside comments for OpenAPI v2 enums
- Fixed issue with compatibility for latest version of Axios (0.27.x)
- Removed deprecated enum model generation

## 0.21.0

### Minor Changes

- Return `undefined` to match `noImplicitReturns` rule
- Made `BaseHttpRequest` class abstract
- Removed private fields using `#` inside `CancelablePromise`
- Removed unneeded import `AbortController` from `node-fetch` client
- Filter out wrong enum values

## 0.20.1

### Patch Changes

- Support enums with single quotes in names for V2

## 0.20.0

### Minor Changes

- Updated dependencies
- Support enums with single quotes in names for V3
- Generating better names when `operationId` is not given (breaking change)
- Fixed issue where `x-enum` flags where breaking due to non-string values

## 0.19.0

### Minor Changes

- Support for Angular client with `--name` option
- Added test cases for Angular client

## 0.18.2

### Patch Changes

- Updated dependencies
- Fixed type definition
- Added test cases for CLI commands
- Added test cases for query parsing

## 0.18.1

### Patch Changes

- Escaping error description
- Made `Client.request` and `BaseHttpRequest.config` props public

## 0.18.0

### Minor Changes

- Angular client generation!
- Updated documentation with more examples and better descriptions

## 0.17.0

### Minor Changes

- Shorthand notation for properties passed through constructor
- Simplified creation of headers
- Prepare codebase for Angular client

## 0.16.2

### Patch Changes

- Removed dependency on `URLSearchParams` to support browser and node without any additional imports

## 0.16.1

### Patch Changes

- Correct export inside `index.ts` when giving a custom name

## 0.16.0

### Minor Changes

- Added option to set the indentation (spaces and tabs)
- Added option to export separate client file that allows usage for multiple backends
- Decoupled OpenAPI object from requests
- Updated dependencies

## 0.15.0

### Minor Changes

- Added change log and releases on GitHub

## 0.14.0

### Minor Changes

- Added missing `postfix` options to typedef
- Updated escaping of comments and descriptions
- Better handling of services without tags
- Updated dependencies
