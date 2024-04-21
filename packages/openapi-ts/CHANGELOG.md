# @hey-api/openapi-ts

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
