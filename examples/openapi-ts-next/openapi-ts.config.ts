import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './app/client',
  },
  plugins: [
    {
      name: '@hey-api/client-fetch',
      runtimeConfigPath: './app/hey-api.ts',
    },
    '@hey-api/sdk',
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
  ],
});
