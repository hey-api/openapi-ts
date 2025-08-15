import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/client',
  },
  plugins: [
    {
      name: '@hey-api/client-angular',
      throwOnError: true,
    },
    {
      exportFromIndex: true,
      httpRequests: true,
      httpResources: {
        asClass: true,
      },
      name: '@angular/common',
    },
    '@hey-api/schemas',
    {
      name: '@hey-api/sdk',
      responseStyle: 'data',
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
  ],
});
