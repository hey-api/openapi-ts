import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  logs: {
    path: './logs',
  },
  output: {
    path: './src/client',
    postProcess: ['oxfmt', 'eslint'],
  },
  parser: {
    pagination: {
      keywords: ['tags', 'limit', 'offset', 'cursor', 'after', 'before'],
    },
  },
  plugins: [
    '@hey-api/client-fetch',
    '@hey-api/schemas',
    {
      instance: true,
      name: '@hey-api/sdk',
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      infiniteQueryOptions: true,
      name: '@tanstack/react-query',
    },
  ],
});
