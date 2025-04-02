# @hey-api/nx-plugin

This library was generated with [Nx](https://nx.dev).

## Generator

### openapi-client

This plugin provides a generator for generating OpenAPI clients using the `@hey-api/openapi-ts` library.

Run `nx g @hey-api/nx-plugin:openapi-client`

#### Options

- `name`: The name of the project. (required)
- `scope`: The scope of the project. (required)
- `spec`: The path to the OpenAPI spec file. (required)
- `directory`: The directory to create the project in. (optional) (default: `libs`)
- `client`: The type of client to generate. (optional) (default: `fetch`)
- `tags`: The tags to add to the project. (optional) (default: `api,openapi`)

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

- `spec`: The path to the OpenAPI spec file. (required)
- `client`: The type of client to generate. (optional) (default: `fetch`)
- `directory`: The directory to create the project in. (optional) (default: `libs`)
- `name`: The name of the project. (required)
- `scope`: The scope of the project. (required)
