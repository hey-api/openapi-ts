import fs from 'node:fs';
import path from 'node:path';

import type { Preset } from '@hey-api/shared';
import { load } from 'js-yaml';

import { buildResourceStrategy } from './resources';
import type { StainlessConfig } from './schema';

function loadStainlessConfig(filePath: string | undefined): StainlessConfig | undefined {
  const configPath = filePath ?? process.env.STAINLESS_CONFIG_PATH;

  if (!configPath) return;

  const resolved = path.resolve(configPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Stainless config not found: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, 'utf-8');
  return load(content) as StainlessConfig;
}

export function stainless(configPath?: string): Preset {
  const config = loadStainlessConfig(configPath);

  if (!config?.resources) {
    return {};
  }

  // console.log(config.resources)

  const strategy = buildResourceStrategy(config.resources);

  return {
    plugins: [
      {
        name: '@hey-api/sdk',
        operations: {
          strategy,
        },
      },
    ],
  };
}
