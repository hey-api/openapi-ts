# @hey-api/openapi-ts

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
