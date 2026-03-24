import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.json',
  logs: {
    path: './logs',
  },
  output: {
    path: './src/client',
    postProcess: ['oxfmt', 'eslint'],
  },
  plugins: ['nestjs', '@hey-api/sdk'],
});
