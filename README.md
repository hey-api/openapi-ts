# Why The Fork?

Mainly, it's because the original project maintainer [doesn't have time](https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1276#issuecomment-1302392146) to support the project. We wanted to keep the development going since this library became incompatible with [FastAPI v0.99.0 release](https://fastapi.tiangolo.com/release-notes/#0990) that introduced support for OpenAPI v3.1. While that was the main objective, this fork also offers other features such as:

- correct handling of 204 response status codes
- ability to select which services to export and naming strategies for generated methods
- support for non-ASCII characters
- support for x-body-name header (compatible with Connexion v3.x)
- ability to autoformat output with Prettier

# OpenAPI Typescript Codegen

> Node.js library that generates Typescript clients based on the OpenAPI specification.

## Why?
- Frontend ❤️ OpenAPI, but we do not want to use Java codegen in our builds
- Quick, lightweight, robust and framework-agnostic 🚀
- Supports generation of TypeScript clients
- Supports generations of Fetch, Node-Fetch, Axios, Angular and XHR http clients
- Supports OpenAPI specification v2.0 and v3.0 (v3.1 is partially supported)
- Supports JSON and YAML files for input
- Supports generation through CLI, Node.js and npx
- Supports tsc and @babel/plugin-transform-typescript
- Supports aborting of requests (cancelable promise pattern)
- Supports external references using [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser/)

## Install

```
npm install @nicolas-chaulet/openapi-typescript-codegen --save-dev
```

or

```
yarn add -D @nicolas-chaulet/openapi-typescript-codegen
```

## Usage

```
$ openapi --help

  Usage: openapi [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content (required)
    -o, --output <value>      Output directory (required)
    -c, --client <value>      HTTP client to generate [fetch, xhr, node, axios, angular] (default: "fetch")
    --name <value>            Custom client class name
    --useOptions              Use options instead of arguments
    --useUnionTypes           Use union types instead of enums
    --exportCore <value>      Write core files to disk (default: true)
    --exportServices <value>  Write services to disk [true, false, regexp] (default: true)
    --exportModels <value>    Write models to disk [true, false, regexp] (default: true)
    --exportSchemas <value>   Write schemas to disk (default: false)
    --indent <value>          Indentation options [4, 2, tab] (default: "4")
    --postfixServices         Service name postfix (default: "Service")
    --postfixModels           Model name postfix
    --request <value>         Path to custom request file
    -h, --help                display help for command

  Examples
    $ openapi --input ./spec.json --output ./generated
    $ openapi --input ./spec.json --output ./generated --client xhr
```

Documentation
===

The original documentation can be found in the [openapi-typescript-codegen/wiki](https://github.com/ferdikoomen/openapi-typescript-codegen/wiki)

