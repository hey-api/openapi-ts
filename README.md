# OpenAPI TypeScript 👋

✨ Turn your OpenAPI specification into a beautiful TypeScript client

## About

`openapi-ts` started as a fork of [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen). We created it after the original project became [unmaintained](https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1276#issuecomment-1302392146) to add support for OpenAPI v3.1. We plan to resolve the most pressing issues in the original project – open an issue if you'd like to prioritise your use case!

## Features

- Generate TypeScript clients from OpenAPI v2.0, v3.0, and v3.1 specifications
- Support JSON or YAML input files
- Handle external references using [JSON Schema $Ref Parser](https://github.com/APIDevTools/json-schema-ref-parser/)
- Generate Fetch, Node-Fetch, Axios, Angular, or XHR HTTP clients
- Can be used with CLI, Node.js, or npx
- Abortable requests through cancellable promise pattern

## Getting Started

Please follow the documentation [here](https://hey-api.github.io/openapi-ts/).

## Contributing

Please refer to the [contributing guide](./CONTRIBUTING.md) for how to install the project for development purposes.
