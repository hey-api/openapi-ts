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
      // throwOnError: true,
    },
    '@hey-api/schemas',
    {
      asClass: false,
      classNameBuilder(name) {
        return `${name}Service`;
      },
      methodNameBuilder(operation) {
        return String(operation.id);
      },
      name: '@hey-api/sdk',
    },
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    '@tanstack/angular-query-experimental',
    {
      asClass: true,
      name: '@hey-api/angular-resource',
    },
  ],
});
