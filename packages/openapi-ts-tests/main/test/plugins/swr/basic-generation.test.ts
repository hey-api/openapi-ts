import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SWR Plugin Basic Generation', () => {
  const version = '3.1.x';
  const namespace = 'plugins';

  const createConfig = (
    userConfig: Omit<UserConfig, 'input'> & Pick<Partial<UserConfig>, 'input'>,
  ): UserConfig => ({
    input: path.join(getSpecsPath(), version, 'security-api-key.json'),
    logs: {
      level: 'silent',
    },
    ...userConfig,
  });

  it('generates SWR hooks with key and fetcher functions', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'basic',
      ),
      plugins: ['@hey-api/typescript', '@hey-api/sdk', 'swr'],
    });

    await createClient(config);

    const outputPath = config.output as string;
    const filePaths = getFilePaths(outputPath);

    // Check that swr.gen.ts was generated
    const swrFile = filePaths.find((filePath) =>
      filePath.endsWith('swr.gen.ts'),
    );
    expect(swrFile).toBeDefined();

    if (swrFile) {
      const fileContent = fs.readFileSync(swrFile, 'utf-8');

      // Verify query Key functions are generated
      expect(fileContent).toContain('Key =');

      // Verify query Options functions are generated
      expect(fileContent).toContain('Options =');

      // Verify key and fetcher structure
      expect(fileContent).toContain('key:');
      expect(fileContent).toContain('fetcher:');

      // Verify types are imported
      expect(fileContent).toContain("from './sdk.gen'");
      expect(fileContent).toContain("from './types.gen'");
    }
  });

  it('generates SWR query hooks with proper TypeScript types', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'types',
      ),
      plugins: [
        '@hey-api/client-fetch',
        '@hey-api/typescript',
        '@hey-api/sdk',
        'swr',
      ],
    });

    await createClient(config);

    const outputPath = config.output as string;
    const swrFile = getFilePaths(outputPath).find((filePath) =>
      filePath.endsWith('swr.gen.ts'),
    );

    expect(swrFile).toBeDefined();

    if (swrFile) {
      const fileContent = fs.readFileSync(swrFile, 'utf-8');

      // Verify query Key functions are generated
      expect(fileContent).toContain('Key =');

      // Verify query Options functions are generated
      expect(fileContent).toContain('Options =');

      // Verify arrow functions are async
      expect(fileContent).toContain('async () => {');

      // Verify proper structure (key and fetcher)
      expect(fileContent).toContain('fetcher:');
    }
  });

  it('generates mutation hooks with proper types for POST requests', async () => {
    const config = createConfig({
      input: path.join(getSpecsPath(), version, 'full.yaml'),
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'mutation-post',
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

      // Verify Mutation functions are generated
      expect(fileContent).toContain('Mutation =');

      // Verify mutation fetcher signature with _key and arg
      // _key is now typed as readonly [string] instead of unknown
      expect(fileContent).toContain('_key: readonly [string]');
      expect(fileContent).toContain('{ arg }');

      // Verify async fetcher for mutations with proper typing
      expect(fileContent).toMatch(
        /fetcher: async \(_key: readonly \[string\].*{ arg }/,
      );

      // Verify key and fetcher structure
      expect(fileContent).toContain('key:');
      expect(fileContent).toContain('fetcher:');
    }
  });

  it('handles required vs optional parameters correctly', async () => {
    const config = createConfig({
      input: path.join(getSpecsPath(), version, 'full.yaml'),
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'parameters',
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

      // Required path parameters should have required options
      // Pattern: (options: Options<...>)
      expect(fileContent).toMatch(/\(options: Options</);

      // Optional parameters should have optional options
      // Pattern: (options?: Options<...>)
      expect(fileContent).toMatch(/\(options\?: Options</);
    }
  });

  it('generates correct types for different HTTP methods', async () => {
    const config = createConfig({
      input: path.join(getSpecsPath(), version, 'full.yaml'),
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'http-methods',
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

      // POST/PUT/PATCH/DELETE should generate Mutation functions
      expect(fileContent).toContain('Mutation');

      // Verify mutations use arg spreading pattern
      expect(fileContent).toContain('...arg');

      // Verify throwOnError is used
      expect(fileContent).toContain('throwOnError: true');
    }
  });
});
