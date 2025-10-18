import path from 'node:path';

import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: path.resolve('..', '..', 'specs', '3.1.x', 'openai.yaml'),
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/client',
  },
  plugins: [
    '@hey-api/client-fetch',
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      instance: 'OpenAI',
      name: '@hey-api/sdk',
    },
  ],
});
