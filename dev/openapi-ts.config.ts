import path from 'node:path';

import { defineConfig } from '@hey-api/openapi-ts';

import { getInput } from './inputs';
import { getPreset } from './typescript/presets';

export default defineConfig(() => [
  {
    input: getInput(),
    logs: {
      path: './logs',
    },
    output: {
      path: path.resolve(__dirname, '.gen', 'typescript'),
    },
    plugins: getPreset(),
  },
]);
