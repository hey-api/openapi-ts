# OpenAPI Client Generator

This NX generator creates a new library project from an OpenAPI specification file. It uses the `@hey-api/openapi-ts` package to generate TypeScript clients, SDKs, and types from the OpenAPI spec.

The generator automatically bundles and dereferences the OpenAPI spec file using Redocly CLI before saving it to the project.

## Usage

```bash
# Using nx directly
nx generate openapi-client <name> --spec=<path-to-spec> --client=<client-type> --scope=<scope> --tags=<tags>

# Interactive mode
nx generate openapi-client
```

## Options

| Option      | Description                                       | Required | Default       |
| ----------- | ------------------------------------------------- | -------- | ------------- |
| `name`      | Library name                                      | Yes      | -             |
| `scope`     | Scope of the project                              | Yes      | -             |
| `spec`      | Path to the OpenAPI spec file (URL or local path) | Yes      | -             |
| `client`    | Type of client to generate                        | No       | `fetch`       |
| `directory` | Directory where the library will be created       | No       | `libs`        |
| `tags`      | Add tags to the library (comma-separated)         | No       | `api,openapi` |

## Examples

```bash
# Generate a fetch API client
nx generate openapi-client my-api --spec=https://example.com/api-spec.yaml --client=@hey-api/client-fetch --scope=@my-app

# Generate an axios client from a local file
nx generate openapi-client my-api --spec=./api-specs/my-api.yaml --client=@hey-api/client-axios --scope=@my-app
```

## Generated Project Structure

The generator creates a new library project with the following structure:

```
libs/<name>/
├── api/
│   └── spec.yaml           # Bundled and dereferenced OpenAPI spec file
├── src/
│   ├── generated/       # Generated API client code (not committed to git)
│   └── index.ts         # Exports everything from generated/
├── vite.config.ts
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
└── openapi-ts.config.ts # Configuration for @hey-api/openapi-ts
```

## Spec Bundling

The generator uses Redocly CLI (`@redocly/cli`) to bundle and dereference the OpenAPI spec file:

1. The original spec file is provided to Redocly CLI which bundles and dereferences the spec file
2. The bundled version is saved to `api/spec.yaml`

This ensures that the spec file used for code generation is self-contained with all references resolved.

## Regenerating the API Client

TODO

## Dependencies

The generator adds the following dependencies to the created project:

- `@hey-api/openapi-ts` - For generating the client code (dev dependency)
- `@hey-api/client-fetch` or `@hey-api/client-axios` - Client implementation (dependency)
- `axios` - If using the axios client (dependency)

The generator also uses `@redocly/cli` from the workspace dependencies for bundling the spec file.

## TODO

- [x] Generate the client code
- [x] Setup tests
- [ ] Make plugins configurable and ability to add additional plugins
- [ ] Add generator to update the API spec file and regenerate the client code
- [ ] Support different test frameworks
- [ ] Support additional client types
