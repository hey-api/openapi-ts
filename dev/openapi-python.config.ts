import path from 'node:path';

import { defineConfig } from '@hey-api/openapi-python';

import { getInput } from './inputs';
import { getPreset } from './python/presets';

export default defineConfig(() => [
  {
    input: getInput(),
    logs: {
      path: './logs',
    },
    output: {
      path: path.resolve(__dirname, '.gen', 'python'),
    },
    plugins: getPreset(),
  },
]);
