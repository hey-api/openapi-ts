# @hey-api/shared

## 0.4.0

### Minor Changes

- **BREAKING**: This release bumps the minimum required Node version to 22.13. ([#3694](https://github.com/hey-api/openapi-ts/pull/3694)) ([`e930278`](https://github.com/hey-api/openapi-ts/commit/e930278d5fcd74545b0fc5d600b524e895d4fe6a)) by [@mrlubos](https://github.com/mrlubos)

### Patch Changes

- **error**: handle InputError ([#3679](https://github.com/hey-api/openapi-ts/pull/3679)) ([`b643d7d`](https://github.com/hey-api/openapi-ts/commit/b643d7d400492489a24918534991dfb3f1443abc)) by [@mrlubos](https://github.com/mrlubos)

### Updated Dependencies:

- @hey-api/json-schema-ref-parser@1.4.0
- @hey-api/codegen-core@0.8.0

## 0.3.0

### Minor Changes

- **internal**: remove `plugin.getSymbol()` function ([#3671](https://github.com/hey-api/openapi-ts/pull/3671)) ([`96f60ad`](https://github.com/hey-api/openapi-ts/commit/96f60adb6af144e39133884e97e74a6693b6c059)) by [@mrlubos](https://github.com/mrlubos)

### Removed `plugin.getSymbol()` function

This function has been removed. You can use `plugin.querySymbol()` instead. It accepts the same arguments and returns the same result.

### Patch Changes

- **plugins**: add request validator helpers ([#3671](https://github.com/hey-api/openapi-ts/pull/3671)) ([`96f60ad`](https://github.com/hey-api/openapi-ts/commit/96f60adb6af144e39133884e97e74a6693b6c059)) by [@mrlubos](https://github.com/mrlubos)

## 0.2.6

### Patch Changes

- **plugin**: fix: `symbolOnce()` method correctly handles multiple symbols with the same metadata ([#3635](https://github.com/hey-api/openapi-ts/pull/3635)) ([`6c1120c`](https://github.com/hey-api/openapi-ts/commit/6c1120cca981880718171327c4c0ae6c295c0638)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **internal**: add `@hey-api/spec-types` dependency ([#3652](https://github.com/hey-api/openapi-ts/pull/3652)) ([`4852795`](https://github.com/hey-api/openapi-ts/commit/485279556f4c73d187a9a2172010b51b2b6ef902)) by [@mrlubos](https://github.com/mrlubos)

### Updated Dependencies:

- @hey-api/spec-types@0.1.0

## 0.2.5

### Patch Changes

- **output**: pass context as second argument in `module.resolve()` function ([#3615](https://github.com/hey-api/openapi-ts/pull/3615)) ([`b6a65d6`](https://github.com/hey-api/openapi-ts/commit/b6a65d6bb3ff1895f2189af858e3424733154bdf)) by [@mrlubos](https://github.com/mrlubos)

- **parser**: fix: self-referencing discriminator ([#3601](https://github.com/hey-api/openapi-ts/pull/3601)) ([`857eb19`](https://github.com/hey-api/openapi-ts/commit/857eb1983fa1ab0f048d426a31835ede563a2c00)) by [@pgraug](https://github.com/pgraug)

- **output**: add `module` option ([#3616](https://github.com/hey-api/openapi-ts/pull/3616)) ([`e4eea23`](https://github.com/hey-api/openapi-ts/commit/e4eea23ab23fb704dfdb9aaad63989be34d5093c)) by [@mrlubos](https://github.com/mrlubos)

### Updated Dependencies:

- @hey-api/codegen-core@0.7.4

## 0.2.4

### Patch Changes

- **utils**: `outputHeaderToPrefix()` function signature change ([#3585](https://github.com/hey-api/openapi-ts/pull/3585)) ([`c076e4d`](https://github.com/hey-api/openapi-ts/commit/c076e4d3e9697d8bbc72db13a31d44627c814c2d)) by [@mrlubos](https://github.com/mrlubos)

- **internal**: remove TypeScript from peer dependencies ([#3566](https://github.com/hey-api/openapi-ts/pull/3566)) ([`b5f1e4b`](https://github.com/hey-api/openapi-ts/commit/b5f1e4b5f64cbf0bad2eff888177ac9c1881ba3e)) by [@mrlubos](https://github.com/mrlubos)

### Updated Dependencies:

- @hey-api/codegen-core@0.7.3
- @hey-api/types@0.1.4

## 0.2.3

### Patch Changes

- **cli**: export isEnvironment function ([#3546](https://github.com/hey-api/openapi-ts/pull/3546)) ([`571bc8a`](https://github.com/hey-api/openapi-ts/commit/571bc8a32b55647083bb506d4a5b575c4736cb94)) by [@mrlubos](https://github.com/mrlubos)

- **internal**: export more IR types ([#3513](https://github.com/hey-api/openapi-ts/pull/3513)) ([`ffe68cd`](https://github.com/hey-api/openapi-ts/commit/ffe68cd4303c39e71152f36c2057165468e64308)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **parser**: add `getName()` symbol hook ([#3556](https://github.com/hey-api/openapi-ts/pull/3556)) ([`68c750a`](https://github.com/hey-api/openapi-ts/commit/68c750ab7ad37c71c4f9b267ddc9e1c90c89924a)) by [@mrlubos](https://github.com/mrlubos)

### Updated Dependencies:

- @hey-api/codegen-core@0.7.2

## 0.2.2

### Patch Changes

- **output**: context file is optional ([#3486](https://github.com/hey-api/openapi-ts/pull/3486)) ([`942913a`](https://github.com/hey-api/openapi-ts/commit/942913af15ae10c5fc3c5e456800829b7dd9c10a)) by [@mrlubos](https://github.com/mrlubos)

- **parser**: fix: explicit discriminator mapping wins over fallback in nested `allOf` ([#3490](https://github.com/hey-api/openapi-ts/pull/3490)) ([`a67d589`](https://github.com/hey-api/openapi-ts/commit/a67d589e1f8e5860bd05d5caff134dd6a7eed6e2)) by [@pgraug](https://github.com/pgraug)

### Updated Dependencies:

- @hey-api/codegen-core@0.7.1

## 0.2.1

### Patch Changes

- **internal**: export schema walker interfaces ([#3396](https://github.com/hey-api/openapi-ts/pull/3396)) ([`ea6f386`](https://github.com/hey-api/openapi-ts/commit/ea6f3865c8e381b3160e1526435c4522f0dc6aa4)) by [@mrlubos](https://github.com/mrlubos)

- **parser(patch)**: support callback for `patch.schemas` ([#3415](https://github.com/hey-api/openapi-ts/pull/3415)) ([`e494f4d`](https://github.com/hey-api/openapi-ts/commit/e494f4dd828167a0096a0a488b222a013f911055)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **parser**: handle OpenAPI 3.1 `contentMediaType` keyword as binary format when file-like ([#3431](https://github.com/hey-api/openapi-ts/pull/3431)) ([`d6a8538`](https://github.com/hey-api/openapi-ts/commit/d6a85381e3c52b4fd1c4af43ee57506459db7a45)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **input**: fix: improve returned status code when spec fetch fails ([#3427](https://github.com/hey-api/openapi-ts/pull/3427)) ([`37dd92c`](https://github.com/hey-api/openapi-ts/commit/37dd92c6629511860ae434c64ac8af9154ed6aed)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **parser**: add `patch.input` and shorthand `patch()` option for full specification transformations ([#3411](https://github.com/hey-api/openapi-ts/pull/3411)) ([`ba9f893`](https://github.com/hey-api/openapi-ts/commit/ba9f893d71b959721e177717ae85fce34d697002)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **parser**: fix: preserve `unevaluatedProperties` keyword in transforms ([#3435](https://github.com/hey-api/openapi-ts/pull/3435)) ([`f659b38`](https://github.com/hey-api/openapi-ts/commit/f659b38701795d2c2b61c8d3f5c43af93893481a)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **parser(transforms)**: add `schemaName` transform ([#3416](https://github.com/hey-api/openapi-ts/pull/3416)) ([`4b9d032`](https://github.com/hey-api/openapi-ts/commit/4b9d032c6a144fa79cedc28e077782b9d67803a3)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **parser(patch)**: support callback for `patch.operations` ([#3420](https://github.com/hey-api/openapi-ts/pull/3420)) ([`e1cd970`](https://github.com/hey-api/openapi-ts/commit/e1cd970e4f3028b29ace44a58b2d2cae18a6c45f)) by [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)

- **parser**: add support for non-string discriminator property types ([#3385](https://github.com/hey-api/openapi-ts/pull/3385)) ([`dd0be9c`](https://github.com/hey-api/openapi-ts/commit/dd0be9c6ca93552c3367ca8e8ba785381295a112)) by [@SipanP](https://github.com/SipanP)

### Updated Dependencies:

- @hey-api/json-schema-ref-parser@1.3.1

## 0.2.0

### Minor Changes

- **utils**: rename `isTopLevelComponentRef` to `isTopLevelComponent` ([#3370](https://github.com/hey-api/openapi-ts/pull/3370)) ([`27cd91f`](https://github.com/hey-api/openapi-ts/commit/27cd91f530bd77da6ea95df1704b2947917b4626)) by [@mrlubos](https://github.com/mrlubos)

### Patch Changes

### Updated Dependencies:

- @hey-api/json-schema-ref-parser@1.3.0

## 0.1.2

### Patch Changes

- **parser**: add `getExportFromFilePath()` hook ([#3322](https://github.com/hey-api/openapi-ts/pull/3322)) ([`bfd43ec`](https://github.com/hey-api/openapi-ts/commit/bfd43ec6d638bfc97b6905dd9dee2c911ccea3e0)) by [@mrlubos](https://github.com/mrlubos)

- **config**: `includeInEntry` accepts function in addition to primitive value ([#3322](https://github.com/hey-api/openapi-ts/pull/3322)) ([`bfd43ec`](https://github.com/hey-api/openapi-ts/commit/bfd43ec6d638bfc97b6905dd9dee2c911ccea3e0)) by [@mrlubos](https://github.com/mrlubos)

- **transform(read-write)**: improve discriminated schemas split ([#3322](https://github.com/hey-api/openapi-ts/pull/3322)) ([`bfd43ec`](https://github.com/hey-api/openapi-ts/commit/bfd43ec6d638bfc97b6905dd9dee2c911ccea3e0)) by [@mrlubos](https://github.com/mrlubos)

### Updated Dependencies:

- @hey-api/codegen-core@0.7.0

## 0.1.1

### Patch Changes

### Updated Dependencies:

- @hey-api/codegen-core@0.6.1

## 0.1.0

### Minor Changes

- **feat**: initial release ([#3251](https://github.com/hey-api/openapi-ts/pull/3251)) ([`7f19d59`](https://github.com/hey-api/openapi-ts/commit/7f19d5921dadfa96ecae84a5298b7aee1daee56d)) by [@mrlubos](https://github.com/mrlubos)

### Patch Changes

### Updated Dependencies:

- @hey-api/codegen-core@0.6.0
- @hey-api/types@0.1.3
