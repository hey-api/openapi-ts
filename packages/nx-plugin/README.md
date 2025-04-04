# @hey-api/nx-plugin

This library was generated with [Nx](https://nx.dev).

## Generator

### openapi-client

[Docs](src/generators/openapi-client/README.md)

This plugin provides a generator for generating OpenAPI clients using the `@hey-api/openapi-ts` library.

Run in interactive mode `nx g @hey-api/nx-plugin:openapi-client`

#### Options

- `name`: The name of the project. [ string ] (required)
- `scope`: The scope of the project. [ string ] (required)
- `spec`: The path to the OpenAPI spec file. [ URI or string ] (required)
- `directory`: The directory to create the project in. [ string ] (optional) (default: `libs`)
- `client`: The type of client to generate. [ string ] (optional) (default: `@hey-api/client-fetch`)
- `tags`: The tags to add to the project. [ string[] ] (optional) (default: `api,openapi`)
- `plugins`: Additional plugins to provide to the client api. [ string[] ] (optional)
- `test`: The type of tests to setup. [ 'none' | 'vitest' ] (optional) (default: `none`)

#### Example

```bash
nx g @hey-api/nx-plugin:openapi-client --name=my-api --client=fetch --scope=@my-app --directory=libs --spec=./spec.yaml --tags=api,openapi
```

## Executors

### update-api

This executor updates the OpenAPI spec file and generates a new client.
The options for the executor will be populated from the generator.

Run `nx run @my-org/my-generated-package:updateApi`

#### Options

- `spec`: The path to the OpenAPI spec file. [ URI or string ] (required)
- `name`: The name of the project. [ string ] (required)
- `scope`: The scope of the project. [ string ] (required)
- `client`: The type of client to generate. [ string ] (optional) (default: `@hey-api/client-fetch`)
- `directory`: The directory to create the project in. [ string ] (optional) (default: `libs`)
- `plugins`: Additional plugins to provide to the client api. [ string[] ] (optional) (default:[])
