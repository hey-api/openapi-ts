# @hey-api/shared

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
