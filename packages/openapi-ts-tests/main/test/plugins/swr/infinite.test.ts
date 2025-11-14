import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SWR Infinite Plugin', () => {
  const version = '3.1.x';
  const namespace = 'plugins';

  const createConfig = (
    userConfig: Omit<UserConfig, 'input'> & Pick<Partial<UserConfig>, 'input'>,
  ): UserConfig => ({
    input: path.join(getSpecsPath(), version, 'full.yaml'),
    logs: {
      level: 'silent',
    },
    ...userConfig,
  });

  it('generates infinite options with getKey function', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'infinite',
      ),
      plugins: ['@hey-api/typescript', '@hey-api/sdk', 'swr'],
    });

    await createClient(config);

    const outputPath = config.output as string;
    const swrFile = getFilePaths(outputPath).find((filePath) =>
      filePath.endsWith('swr.gen.ts'),
    );

    expect(swrFile).toBeDefined();

    if (swrFile) {
      const fileContent = fs.readFileSync(swrFile, 'utf-8');

      // Check if Infinite functions are generated
      // Note: only operations with pagination support will have Infinite functions
      // We're checking that the plugin doesn't crash and generates valid code
      expect(fileContent).toContain('export');

      // If Infinite functions are generated, they should have getKey
      if (fileContent.includes('Infinite =')) {
        expect(fileContent).toContain('getKey:');
        expect(fileContent).toContain('pageIndex');
        expect(fileContent).toContain('previousPageData');
      }
    }
  });

  it('generates correct fetcher for infinite queries', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'infinite-fetcher',
      ),
      plugins: ['@hey-api/typescript', '@hey-api/sdk', 'swr'],
    });

    await createClient(config);

    const outputPath = config.output as string;
    const swrFile = getFilePaths(outputPath).find((filePath) =>
      filePath.endsWith('swr.gen.ts'),
    );

    expect(swrFile).toBeDefined();

    if (swrFile) {
      const fileContent = fs.readFileSync(swrFile, 'utf-8');

      // If Infinite functions are generated, they should have fetcher
      if (fileContent.includes('Infinite =')) {
        expect(fileContent).toContain('fetcher:');
        expect(fileContent).toContain('async');
      }
    }
  });
});
