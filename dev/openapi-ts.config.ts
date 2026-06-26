import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

import { defineConfig } from '@hey-api/openapi-ts';

import { getInput } from './inputs';
import { getPreset } from './typescript/presets';

process.env = {
  ...process.env,
  ...parseEnv(fs.readFileSync(path.resolve(import.meta.dirname, '.env'), 'utf-8')),
};

export default defineConfig(() => [
  {
    input: getInput(),
    logs: {
      path: './logs',
    },
    output: {
      path: path.resolve(import.meta.dirname, 'gen', 'typescript'),
    },
    plugins: [...getPreset()],
  },
]);
