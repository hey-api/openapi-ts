import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://gist.githubusercontent.com/seriousme/55bd4c8ba2e598e416bb5543dcd362dc/raw/cf0b86ba37bb54bf1a6bf047c0ecf2a0ce4c62e0/petstore-v3.1.json',
  output: {
    path: './src/client',
    postProcess: ['oxfmt', 'eslint'],
  },
  plugins: ['fastify', '@hey-api/sdk'],
});
