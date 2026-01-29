import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  output: {
    path: './src/client',
    postProcess: ['oxfmt', 'eslint'],
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
        containerName: '{{name}}ServiceResources',
        strategy: 'byTags',
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
