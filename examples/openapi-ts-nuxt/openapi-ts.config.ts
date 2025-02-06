import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './client',
  },
  plugins: [
    '@hey-api/client-nuxt',
    '@hey-api/schemas',
    {
      name: '@hey-api/sdk',
      transformer: true,
      validator: true,
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    '@hey-api/transformers',
    'zod',
  ],
});
