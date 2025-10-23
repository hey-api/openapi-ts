# StackBlitz Examples

All examples (except `openapi-ts-sample`) are available on StackBlitz via GitHub imports. These examples showcase `@hey-api/openapi-ts` with various frameworks and libraries.

## Available Examples

### Client Integrations

- **[Fetch API](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-fetch)**  
  Native Fetch API client implementation with React + Vite

- **[Axios](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-axios)**  
  Using Axios HTTP client

- **[ofetch](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-ofetch)**  
  Using ofetch client (universal fetch wrapper)

### Framework Integrations

- **[Angular](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-angular)**  
  Angular integration with common HTTP client

- **[Angular Common HTTP](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-angular-common)**  
  Angular with @angular/common/http

- **[Next.js](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-next)**  
  Next.js integration

- **[Nuxt](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-nuxt)**  
  Nuxt.js integration with plugin

### State Management & Data Fetching

- **[TanStack React Query](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-tanstack-react-query)**  
  React with TanStack Query for data fetching and caching

- **[TanStack Vue Query](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-tanstack-vue-query)**  
  Vue.js with TanStack Query

- **[TanStack Svelte Query](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-tanstack-svelte-query)**  
  Svelte with TanStack Query

- **[TanStack Angular Query (Experimental)](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-tanstack-angular-query-experimental)**  
  Angular with TanStack Query (experimental)

- **[Pinia Colada](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-pinia-colada)**  
  Vue with Pinia Colada state management

### Server-Side

- **[Fastify](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-fastify)**  
  Fastify server integration

### API-Specific

- **[OpenAI](https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-openai)**  
  OpenAI API integration

## How It Works

Examples are automatically kept in sync with the latest release:

1. During development, examples use `workspace:*` references to test against local code
2. When a new version is published to npm, the release workflow automatically updates example `package.json` files to use the published version
3. These changes are committed to the `main` branch
4. StackBlitz imports directly from GitHub, so the examples are always up-to-date

## Stable URLs

The URLs above are stable permalinks that will always work. StackBlitz automatically pulls the latest code from the `main` branch when you open them.

You can also link to specific versions using git tags:

```
https://stackblitz.com/github/hey-api/openapi-ts/tree/v0.55.0/examples/openapi-ts-fetch
```

## View All Examples

Browse all examples in the [StackBlitz Collection](https://stackblitz.com/orgs/github/hey-api/collections/openapi-ts-examples) (manually curated).

## Local Development

To run examples locally, see the main [Examples README](./README.md).
