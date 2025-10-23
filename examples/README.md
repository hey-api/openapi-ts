# Examples

This directory contains integration examples demonstrating how to use `@hey-api/openapi-ts` with various frameworks, libraries, and client implementations.

## Available Examples

- **openapi-ts-angular** - Angular integration with common HTTP client
- **openapi-ts-angular-common** - Angular with @angular/common/http
- **openapi-ts-axios** - Using Axios client
- **openapi-ts-fastify** - Fastify server integration
- **openapi-ts-fetch** - Native Fetch API client
- **openapi-ts-next** - Next.js integration
- **openapi-ts-nuxt** - Nuxt.js integration with plugin
- **openapi-ts-ofetch** - Using ofetch client
- **openapi-ts-openai** - OpenAI API integration
- **openapi-ts-pinia-colada** - Vue with Pinia Colada state management
- **openapi-ts-sample** - Sample/template example (excluded from CI)
- **openapi-ts-tanstack-angular-query-experimental** - Angular with TanStack Query
- **openapi-ts-tanstack-react-query** - React with TanStack Query
- **openapi-ts-tanstack-svelte-query** - Svelte with TanStack Query
- **openapi-ts-tanstack-vue-query** - Vue with TanStack Query

## Generated Code

All examples (except `openapi-ts-sample`) contain generated client code that is **committed to the repository**. This ensures:

1. Examples always reflect the current state of the code generator
2. Changes to the code generator are visible in pull requests
3. CI can verify that examples are kept up-to-date

## Regenerating Examples

After making changes to the core packages, regenerate all example code:

```bash
pnpm examples:generate
```

This command will run `openapi-ts` for each example that has an `openapi-ts` script in its `package.json`.

## Verifying Examples

To check if all examples are up-to-date with the current codebase:

```bash
pnpm examples:check
```

This check is also run automatically in CI. If it fails, run `pnpm examples:generate` and commit the changes.

## Running Examples

Each example can be run individually using the `example` script:

```bash
# Run dev server for fetch example
pnpm example fetch dev

# Build fetch example
pnpm example fetch build
```

Or directly using pnpm filters:

```bash
pnpm --filter @example/openapi-ts-fetch dev
```

## Creating New Examples

When creating a new example:

1. Create a new directory in `examples/`
2. Add an `openapi-ts` script to `package.json`
3. Run `pnpm examples:generate` to create initial generated code
4. Commit both the source and generated code
5. The example will automatically be included in CI checks

## Excluding Examples

To exclude an example from CI (like `openapi-ts-sample`):

1. Remove the `openapi-ts` script from `package.json`, or
2. Update the exclusion filters in `package.json` scripts and `.github/workflows/ci.yml`
