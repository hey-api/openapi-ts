import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/client',
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
