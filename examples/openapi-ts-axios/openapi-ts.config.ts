import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  base: 'https://petstore3.swagger.io/api/v3',
  format: 'prettier',
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  lint: 'eslint',
  output: './src/client',
});
