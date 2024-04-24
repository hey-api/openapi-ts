import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  format: 'prettier',
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  lint: 'eslint',
  output: './src/client',
});
