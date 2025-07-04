---
'@hey-api/openapi-ts': minor
---

feat(config): add `parser` options

### Added `parser` options

Previously, `@hey-api/typescript` would generate correct types, but the validator plugins would have to re-implement the same logic or generate schemas that didn't match the generated types.

Since neither option was ideal, this release adds a dedicated place for `parser` options. Parser is responsible for preparing the input so plugins can generate more accurate output with less effort.

You can learn more about configuring parser on the [Parser](https://heyapi.dev/openapi-ts/configuration/parser) page.

### Moved `input` options

The following options were moved to the new `parser` group.

- `input.filters` moved to `parser.filters`
- `input.pagination` moved to `parser.pagination`
- `input.patch` moved to `parser.patch`
- `input.validate_EXPERIMENTAL` moved to `parser.validate_EXPERIMENTAL`

### Updated `typescript` options

The following options were renamed.

- `enumsCase` moved to `enums.case`
- `enumsConstantsIgnoreNull` moved to `enums.constantsIgnoreNull`

### Moved `typescript` options

The following options were moved to the new `parser` group.

- `exportInlineEnums` moved to `parser.transforms.enums`
- `readOnlyWriteOnlyBehavior` moved to `parser.transforms.readWrite.enabled`
- `readableNameBuilder` moved to `parser.transforms.readWrite.responses.name`
- `writableNameBuilder` moved to `parser.transforms.readWrite.requests.name`

### Updated `readWrite.responses` name

Additionally, the naming pattern for response schemas has changed from `{name}Readable` to `{name}`. This is to prevent your code from breaking by default when using a schema that gets updated with a write-only field.
