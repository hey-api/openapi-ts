import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { UserConfig } from '../src/types/config';
import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = '2.0';

const outputDir = path.join(__dirname, 'generated', VERSION);

describe(`OpenAPI ${VERSION}`, () => {
  const createConfig = (userConfig: UserConfig): UserConfig => ({
    client: '@hey-api/client-fetch',
    schemas: false,
    ...userConfig,
    input: path.join(
      __dirname,
      'spec',
      VERSION,
      typeof userConfig.input === 'string' ? userConfig.input : '',
    ),
    output: path.join(
      outputDir,
      typeof userConfig.output === 'string' ? userConfig.output : '',
    ),
  });

  const scenarios = [
    {
      config: createConfig({
        input: 'form-data.json',
        output: 'form-data',
      }),
      description: 'handles form data',
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
          VERSION,
          filePath.slice(outputDir.length + 1),
        ),
      );
    });
  });
});
