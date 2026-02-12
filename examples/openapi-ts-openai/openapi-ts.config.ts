import path from 'node:path';

import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: path.resolve('..', '..', 'specs', '3.1.x', 'openai.yaml'),
  logs: {
    path: './logs',
  },
  output: {
    path: './src/client',
    postProcess: ['oxfmt'],
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
