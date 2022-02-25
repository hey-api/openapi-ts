# Changelog
All notable changes to this project will be documented in this file.

## [0.20.1] - 2022-02-25
### Fixed
- Support enums with single quotes in names for V2

## [0.20.0] - 2022-02-25
### Fixed
- Updated dependencies
- Support enums with single quotes in names for V3
- Generating better names when `operationId` is not given (breaking change)
- Fixed issue where `x-enum` flags where breaking due to non-string values

## [0.19.0] - 2022-02-02
### Added
- Support for Angular client with `--name` option
- Added test cases for Angular client

## [0.18.2] - 2022-02-02
### Fixed
- Updated dependencies
- Fixed type definition
### Added
- Added test cases for CLI commands
- Added test cases for query parsing

## [0.18.1] - 2022-01-31
### Fixed
- Escaping error description
- Made `Client.request` and `BaseHttpRequest.config` props public

_## [0.18.0] - 2022-01-28
### Added
- Angular client generation!
- Updated documentation with more examples and better descriptions

## [0.17.0] - 2022-01-26
### Fixed
- Shorthand notation for properties passed through constructor
- Simplified creation of headers
- Prepare codebase for Angular client

## [0.16.2] - 2022-01-26
### Fixed
- Removed dependency on `URLSearchParams` to support browser and node without any additional imports

## [0.16.1] - 2022-01-26
### Fixed
- Correct export inside `index.ts` when giving a custom name

## [0.16.0] - 2022-01-25
### Added
- Added option to set the indentation (spaces and tabs)
- Added option to export separate client file that allows usage for multiple backends
### Fixed
- Decoupled OpenAPI object from requests
- Updated dependencies

## [0.15.0] - 2022-01-24
### Added
- Added change log and releases on GitHub

## [0.14.0] - 2022-01-24
### Fixed
- Added missing `postfix` options to typedef
- Updated escaping of comments and descriptions
- Better handling of services without tags
- Updated dependencies
