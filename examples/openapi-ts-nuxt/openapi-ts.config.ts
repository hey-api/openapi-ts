import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-nuxt',
  experimentalParser: true,
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './client',
  },
  plugins: [
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
