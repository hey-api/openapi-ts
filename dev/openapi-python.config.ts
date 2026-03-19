import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

import { defineConfig } from '@hey-api/openapi-python';

import { getInput } from './inputs';
import { getPreset } from './python/presets';

process.env = {
  ...process.env,
  ...parseEnv(fs.readFileSync(path.resolve(__dirname, '.env'), 'utf-8')),
};

export default defineConfig(() => [
  {
    input: getInput(),
    logs: {
      path: './logs',
    },
    output: {
      path: path.resolve(__dirname, 'gen', 'python'),
    },
    plugins: getPreset(),
  },
]);
