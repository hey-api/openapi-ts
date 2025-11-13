import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('SWR Plugin Edge Cases', () => {
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

  it('handles operations with no parameters', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-no-params',
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

      // Operations with no parameters should have optional options
      expect(fileContent).toMatch(/\(options\?: Options</);

      // Should still generate key and fetcher
      expect(fileContent).toContain('key:');
      expect(fileContent).toContain('fetcher:');
    }
  });

  it('handles operations with only path parameters', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-path-only',
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

      // Path parameters should be required
      expect(fileContent).toMatch(/\(options: Options</);

      // Key should return array with path template and options
      // New format: ['/path/{param}', options]
      expect(fileContent).toMatch(/=> \["\/[^"]*\{[^}]+\}[^"]*",\s*options\]/);
    }
  });

  it('handles operations with only query parameters', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-query-only',
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

      // Query parameters might be optional
      expect(fileContent).toMatch(/options\??: Options</);
    }
  });

  it('handles operations with path + query parameters', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-path-query',
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

      // Should generate functions with options parameter
      expect(fileContent).toMatch(/\(options\??: Options</);

      // Should have key and fetcher
      expect(fileContent).toContain('key:');
      expect(fileContent).toContain('fetcher:');
    }
  });

  it('handles operations with body + path parameters', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-body-path',
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

      // Should generate Mutation functions for POST/PUT/PATCH
      expect(fileContent).toContain('Mutation');

      // Should use arg spreading pattern for body + path
      expect(fileContent).toContain('...arg');
    }
  });

  it('handles array responses', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-array-response',
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

      // Should generate functions that return data
      expect(fileContent).toContain('return data;');

      // Should have proper async fetcher
      expect(fileContent).toContain('async');
    }
  });

  it('handles nullable responses', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-nullable',
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

      // Should generate functions with proper return types
      expect(fileContent).toContain('return data;');
    }
  });

  it('generates correct SWR keys for complex parameters', async () => {
    const config = createConfig({
      output: path.join(
        __dirname,
        'generated',
        version,
        namespace,
        'swr',
        'edge-complex-keys',
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

      // Key functions should be generated
      expect(fileContent).toContain('Key =');

      // Keys should be functions that return arrays (SWR format)
      // With new refactoring: ['/path', options] or just ['/path']
      // Check for arrow function returning array: => ['/path'] or => ['/path', options]
      expect(fileContent).toMatch(/=> \[["']\/[^"']*["']/);

      // Keys should contain path strings
      expect(fileContent).toMatch(/["']\/(?:api\/)?[^"']*["']/);
    }
  });
});
