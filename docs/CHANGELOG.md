# @docs/openapi-ts

## 0.10.2

### Patch Changes

- [#2117](https://github.com/hey-api/openapi-ts/pull/2117) [`a1435b9`](https://github.com/hey-api/openapi-ts/commit/a1435b915a272d9ffa599c194ee52c2a33f77fcd) Thanks [@johnny-mh](https://github.com/johnny-mh)! - docs: add docs for `input.patch` feature

## 0.10.1

### Patch Changes

- [#1774](https://github.com/hey-api/openapi-ts/pull/1774) [`c0b36b9`](https://github.com/hey-api/openapi-ts/commit/c0b36b95645d484034c3af145c5554867568979b) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: announce Hey API platform

## 0.10.0

### Minor Changes

- [#1568](https://github.com/hey-api/openapi-ts/pull/1568) [`465410c`](https://github.com/hey-api/openapi-ts/commit/465410c201eb19e737e3143ad53a146e95f80107) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: change the default parser

## 0.9.0

### Minor Changes

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

### Patch Changes

- [#1496](https://github.com/hey-api/openapi-ts/pull/1496) [`1e418ba`](https://github.com/hey-api/openapi-ts/commit/1e418ba760b9903326ec37009651c32e195e24a9) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: split output section into multiple pages

## 0.8.0

### Minor Changes

- [#1447](https://github.com/hey-api/openapi-ts/pull/1447) [`200821b`](https://github.com/hey-api/openapi-ts/commit/200821b3ceea8ffca7656fe3f6e2ef98b7110a2a) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: revert license to MIT

### Patch Changes

- [#1430](https://github.com/hey-api/openapi-ts/pull/1430) [`9cec9e8`](https://github.com/hey-api/openapi-ts/commit/9cec9e8582c12a8c041b922d9587e16f6f19782a) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add validators page

## 0.7.4

### Patch Changes

- [#1420](https://github.com/hey-api/openapi-ts/pull/1420) [`8010dbb`](https://github.com/hey-api/openapi-ts/commit/8010dbb1ab8b91d1d49d5cf16276183764a63ff3) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add buildUrl() method to Axios client page

## 0.7.3

### Patch Changes

- [#1316](https://github.com/hey-api/openapi-ts/pull/1316) [`a79fac8`](https://github.com/hey-api/openapi-ts/commit/a79fac8919ed29eec7195cbd441ffa38b559d63c) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add Plugins page

## 0.7.2

### Patch Changes

- [#1253](https://github.com/hey-api/openapi-ts/pull/1253) [`01dee3d`](https://github.com/hey-api/openapi-ts/commit/01dee3df879232939e43355231147b3d910fb482) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update sponsorship links

## 0.7.1

### Patch Changes

- [#1222](https://github.com/hey-api/openapi-ts/pull/1222) [`ceb4363`](https://github.com/hey-api/openapi-ts/commit/ceb4363d52893ebe947e21aac402b868ff2820d4) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: add support for @tanstack/angular-query-experimental package

## 0.7.0

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

## 0.6.2

### Patch Changes

- [#1162](https://github.com/hey-api/openapi-ts/pull/1162) [`1c85c24`](https://github.com/hey-api/openapi-ts/commit/1c85c24af514e9781aab1960298caa28effef5d3) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add Zod plugin page

## 0.6.1

### Patch Changes

- [#1151](https://github.com/hey-api/openapi-ts/pull/1151) [`587791d`](https://github.com/hey-api/openapi-ts/commit/587791dfede0167fbed229281467e4c4875936f5) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: update website domain, add license documentation

## 0.6.0

### Minor Changes

- [#1009](https://github.com/hey-api/openapi-ts/pull/1009) [`c6b044d`](https://github.com/hey-api/openapi-ts/commit/c6b044d0bc9dc54cb0eb58d23438f4e1d050cb38) Thanks [@mrlubos](https://github.com/mrlubos)! - feat: change schemas name pattern, add schemas.name option

## 0.5.11

### Patch Changes

- [#978](https://github.com/hey-api/openapi-ts/pull/978) [`2e051a5`](https://github.com/hey-api/openapi-ts/commit/2e051a596302c2e103dca25951a07b4aae1e9e23) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add basic TanStack Query plugin description

## 0.5.10

### Patch Changes

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`babf11a`](https://github.com/hey-api/openapi-ts/commit/babf11ae082af642ac71cfee9c523cc976132a50) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: split clients documentation into separate pages

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`323d0a0`](https://github.com/hey-api/openapi-ts/commit/323d0a03c6560f27d0ce5eee1708ee16dc395532) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: remove interceptors page in favour of per-client sections

- [#830](https://github.com/hey-api/openapi-ts/pull/830) [`babf11a`](https://github.com/hey-api/openapi-ts/commit/babf11ae082af642ac71cfee9c523cc976132a50) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add v0.52.0 migration

## 0.5.9

### Patch Changes

- [#828](https://github.com/hey-api/openapi-ts/pull/828) [`82a4696`](https://github.com/hey-api/openapi-ts/commit/82a4696b0b209ea2d9147f47f213479e61aed3d7) Thanks [@mrlubos](https://github.com/mrlubos)! - fix: add migration guide for v0.51.0

## 0.5.8

### Patch Changes

- [#613](https://github.com/hey-api/openapi-ts/pull/613) [`b3786dc`](https://github.com/hey-api/openapi-ts/commit/b3786dc6749d8d4ae26bb63322e124663f881741) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add Axios client documentation

## 0.5.7

### Patch Changes

- [#632](https://github.com/hey-api/openapi-ts/pull/632) [`9c16bc7`](https://github.com/hey-api/openapi-ts/commit/9c16bc71cde48c0cb700b7e720a9e2ad56ec5f02) Thanks [@mrlubos](https://github.com/mrlubos)! - docs: add output page

## 0.5.6

### Patch Changes

- docs: add fetch client documentation ([#602](https://github.com/hey-api/openapi-ts/pull/602))

- docs: add migration notes for v0.46.0 ([#602](https://github.com/hey-api/openapi-ts/pull/602))

## 0.5.5

### Patch Changes

- docs: add migration for v0.45.0 ([#569](https://github.com/hey-api/openapi-ts/pull/569))

## 0.5.4

### Patch Changes

- docs: add format and lint migration for 0.44.0 ([#546](https://github.com/hey-api/openapi-ts/pull/546))

## 0.5.3

### Patch Changes

- docs: add links to homepage ([#489](https://github.com/hey-api/openapi-ts/pull/489))

- feat: remove enum postfix, use typescript enums in types when generated, export enums from types.gen.ts ([#498](https://github.com/hey-api/openapi-ts/pull/498))

- docs: add examples ([#476](https://github.com/hey-api/openapi-ts/pull/476))

## 0.5.2

### Patch Changes

- docs: add github action to integrations ([#451](https://github.com/hey-api/openapi-ts/pull/451))

## 0.5.1

### Patch Changes

- docs: add tanstack-query and http clients sections ([#436](https://github.com/hey-api/openapi-ts/pull/436))

## 0.5.0

### Minor Changes

- feat: allow choosing naming convention for types ([#402](https://github.com/hey-api/openapi-ts/pull/402))

## 0.4.0

### Minor Changes

- docs: add integrations ([#394](https://github.com/hey-api/openapi-ts/pull/394))

- feat: rename generated files ([#363](https://github.com/hey-api/openapi-ts/pull/363))

### Patch Changes

- docs: add enums migration ([#358](https://github.com/hey-api/openapi-ts/pull/358))

## 0.3.0

### Minor Changes

- fix: rename write to dryRun and invert value ([#326](https://github.com/hey-api/openapi-ts/pull/326))

### Patch Changes

- docs: update contributing guidelines ([#347](https://github.com/hey-api/openapi-ts/pull/347))

## 0.2.2

### Patch Changes

- docs: add migration notes ([#306](https://github.com/hey-api/openapi-ts/pull/306))

## 0.2.1

### Patch Changes

- fix(config): rename exportSchemas to schemas ([#288](https://github.com/hey-api/openapi-ts/pull/288))

## 0.2.0

### Minor Changes

- docs: add support for localization of docs ([#251](https://github.com/hey-api/openapi-ts/pull/251))

### Patch Changes

- docs: add logo ([#250](https://github.com/hey-api/openapi-ts/pull/250))
