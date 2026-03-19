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
  plugins: [
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '../hey-api',
    },
    '@hey-api/sdk',
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
  ],
});
