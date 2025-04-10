# OpenAPI Client Generator

This NX generator creates a new library project from an OpenAPI specification file. It uses the `@hey-api/openapi-ts` package to generate TypeScript clients, SDKs, and types from the OpenAPI spec.

## Usage

```bash
# Using nx directly
nx generate openapi-client <name> --spec=<path-to-spec> --client=<client-type> --scope=<project-scope>

# Interactive mode
nx generate openapi-client
```

## Options

| Option      | Description                                       | Required | Default                 | Type               |
| ----------- | ------------------------------------------------- | -------- | ----------------------- | ------------------ |
| `name`      | Library name                                      | Yes      | -                       | string             |
| `scope`     | Scope of the project                              | Yes      | -                       | string             |
| `spec`      | Path to the OpenAPI spec file (URL or local path) | Yes      | -                       | string             |
| `client`    | Type of client to generate                        | No       | `@hey-api/client-fetch` | string             |
| `directory` | Directory where the library will be created       | No       | `libs`                  | string             |
| `tags`      | Add tags to the library (comma-separated)         | No       | `api,openapi`           | string[]           |
| `plugins`   | Additional plugins for client                     | No       | []                      | string[]           |
| `test`      | Tests to generate                                 | No       | `none`                  | 'none' or 'vitest' |

## Examples

```bash
# Generate a fetch API client
nx generate openapi-client my-api --spec=https://example.com/api-spec.yaml --client=@hey-api/client-fetch

# Generate an axios client from a local file
nx generate openapi-client my-api --spec=./api-specs/my-api.yaml --client=@hey-api/client-axios

# Generate with custom directory and tags
nx generate openapi-client my-api --spec=./api-specs/my-api.yaml --directory=libs/api --tags=api,openapi,my-service

# Generates with test files
nx generate openapi-client my-api --spec=./api-specs/my-api.yaml --directory=libs/api --test=vitest
```

## Generated Project Structure

The generator creates a new library project with the following structure:

```
libs/<name>/
├── api/
│   └── spec.yaml        # Bundled and dereferenced OpenAPI spec file
├── src/
│   ├── generated/       # Generated API client code (not committed to git)
|   ├── client.spec.ts   # Unit test for the client code
│   ├── index.ts         # Exports everything from generated/
|   └── rq.ts            # Exports tanstack query client code
├── package.json
├── vitest.config.ts     # Vitest configuration
├── README.md
├── project.json         # NX project configuration
├── tsconfig.json        # root config
├── tsconfig.lib.json    # library config
├── tsconfig.spec.json   # test config
└── openapi-ts.config.ts # Configuration for @hey-api/openapi-ts
```

## Generating the API Client

After the project is created, you can regenerate the API client at any time:

```bash
# Using nx
nx run <project-scope>/<project-name>:updateApi

# Using npm script (from the project root)
npm run update
```

## Dependencies

The generator adds the following dependencies to the created project:

- `@hey-api/openapi-ts` - For generating the client code (dev dependency)
- `@hey-api/client-fetch` or `@hey-api/client-axios` or whichever client is provided - Client implementation (dependency)
- `axios` - If using the axios client (dependency)

## TODO

- [x] Generate the client code
- [x] Setup tests for generated code
- [x] Add generator to update the API spec file and regenerate the client code
- [x] Make plugins configurable and ability to add additional plugins
- [x] Support additional client types
- [x] Dogfood the spec bundling and dereferencing
- [ ] Support different test frameworks
- [ ] Add linting generation for
