import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { UserConfig } from '../src/types/config';
import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('OpenAPI 3.1.0', () => {
  const createConfig = (userConfig: UserConfig): UserConfig => ({
    client: '@hey-api/client-fetch',
    schemas: false,
    ...userConfig,
    input: path.join(
      __dirname,
      'spec',
      '3.1.0',
      typeof userConfig.input === 'string' ? userConfig.input : '',
    ),
    output: path.join(
      __dirname,
      'generated',
      '3.1.0',
      typeof userConfig.output === 'string' ? userConfig.output : '',
    ),
  });

  const scenarios = [
    {
      config: createConfig({
        input: 'duplicate-null.json',
        output: 'duplicate-null',
        services: {
          export: false,
        },
      }),
      description: 'does not generate duplicate null',
    },
  ];

  it.each(scenarios)('$description', async ({ config }) => {
    // @ts-ignore
    await createClient(config);

    const outputPath = typeof config.output === 'string' ? config.output : '';
    const filePaths = getFilePaths(outputPath);

    filePaths.forEach((filePath) => {
      const fileContent = readFileSync(filePath, 'utf-8');
      expect(fileContent).toMatchFileSnapshot(
        path.join(
          __dirname,
          '__snapshots__',
          '3.1.0',
          filePath.slice(outputPath.length + 1),
        ),
      );
    });
  });
});
