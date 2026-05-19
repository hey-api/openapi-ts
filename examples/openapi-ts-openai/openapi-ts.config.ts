import path from 'node:path';

import { defineConfig, type UserConfig } from '@hey-api/openapi-ts';

const config: Promise<UserConfig> = defineConfig({
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

export default config;
