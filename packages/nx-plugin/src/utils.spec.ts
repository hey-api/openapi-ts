import { randomUUID } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import { getSpec, type initConfigs } from '@hey-api/openapi-ts/internal';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bundleAndDereferenceSpecFile,
  generateClientCode,
  generateClientCommand,
  getPackageName,
  getVersionOfPackage,
  isAFile,
  isUrl,
} from './utils';

vi.mock('@hey-api/openapi-ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hey-api/openapi-ts')>();
  return {
    ...actual,
    createClient: vi.fn(),
  };
});

vi.mock('@hey-api/openapi-ts/internal', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@hey-api/openapi-ts/internal')>();
  return {
    ...actual,
    getSpec: vi.fn(() =>
      Promise.resolve({
        data: {},
        error: null,
      }),
    ),
    initConfigs: vi.fn((config: Parameters<typeof initConfigs>[0]) =>
      Promise.resolve([
        {
          input: config?.input ?? 'default-input',
          output: config?.output ?? 'default-output',
          plugins: config?.plugins ?? [],
        },
      ]),
    ),
    parseOpenApiSpec: vi.fn(() => ({
      spec: {
        name: 'test-name',
      },
    })),
  };
});

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('generateClientCommand', () => {
    it('should generate command without plugins', () => {
      const command = generateClientCommand({
        clientType: '@hey-api/client-fetch',
        outputPath: './src/generated',
        plugins: [],
        specFile: './api/spec.yaml',
      });

      expect(command).toBe(
        'npx @hey-api/openapi-ts -i ./api/spec.yaml -o ./src/generated -c @hey-api/client-fetch',
      );
    });

    it('should generate command with plugins', () => {
      const command = generateClientCommand({
        clientType: '@hey-api/client-fetch',
        outputPath: './src/generated',
        plugins: ['@tanstack/react-query', 'zod'],
        specFile: './api/spec.yaml',
      });

      expect(command).toBe(
        'npx @hey-api/openapi-ts -i ./api/spec.yaml -o ./src/generated -c @hey-api/client-fetch -p @tanstack/react-query,zod',
      );
    });
  });

  describe('getVersionOfPackage', () => {
    it('should extract version from package name with version', () => {
      expect(getVersionOfPackage('@hey-api/client-fetch@0.9.0')).toBe('0.9.0');
      expect(getVersionOfPackage('axios@1.2.3')).toBe('1.2.3');
    });

    it('should return undefined for package name without version', () => {
      expect(getVersionOfPackage('@hey-api/client-fetch')).toBeUndefined();
      expect(getVersionOfPackage('axios')).toBeUndefined();
    });

    it('should handle scoped packages correctly', () => {
      expect(getVersionOfPackage('@scope/package@1.0.0')).toBe('1.0.0');
      expect(getVersionOfPackage('@scope/package')).toBeUndefined();
    });
  });

  describe('getPackageName', () => {
    it('should extract package name from package with version', () => {
      expect(getPackageName('@hey-api/client-fetch@0.9.0')).toBe(
        '@hey-api/client-fetch',
      );
      expect(getPackageName('axios@1.2.3')).toBe('axios');
    });

    it('should return same name for package without version', () => {
      expect(getPackageName('@hey-api/client-fetch')).toBe(
        '@hey-api/client-fetch',
      );
      expect(getPackageName('axios')).toBe('axios');
    });

    it('should handle scoped packages correctly', () => {
      expect(getPackageName('@scope/package@1.0.0')).toBe('@scope/package');
      expect(getPackageName('@scope/package')).toBe('@scope/package');
    });
  });

  describe('generateClientCode', () => {
    it('should execute command successfully', async () => {
      await expect(
        generateClientCode({
          clientType: '@hey-api/client-fetch',
          outputPath: './src/generated',
          plugins: [],
          specFile: './api/spec.yaml',
        }),
      ).resolves.not.toThrow();

      expect(createClient).toHaveBeenCalledWith({
        input: './api/spec.yaml',
        output: './src/generated',
        plugins: ['@hey-api/client-fetch'],
      });
    });

    it('should throw error when command fails', async () => {
      vi.mocked(createClient).mockImplementationOnce(() => {
        throw new Error('Command failed');
      });

      await expect(
        generateClientCode({
          clientType: '@hey-api/client-fetch',
          outputPath: './src/generated',
          plugins: [],
          specFile: './api/spec.yaml',
        }),
      ).rejects.toThrow('Command failed');
    });
  });

  describe('bundleAndDereferenceSpecFile', () => {
    it('should execute bundle command successfully', async () => {
      // write temp spec file
      const specAsYaml = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      summary: Test endpoint
      responses:
        '200':
          description: A successful response
`;
      const tempSpecFile = join(
        process.cwd(),
        `temp-spec-${randomUUID()}.yaml`,
      );
      await writeFile(tempSpecFile, specAsYaml);

      const dereferencedSpec = await bundleAndDereferenceSpecFile({
        client: '@hey-api/client-fetch',
        outputPath: './output/dereferenced-spec.yaml',
        plugins: [],
        specPath: tempSpecFile,
      });

      expect(dereferencedSpec).toBeDefined();
      expect((dereferencedSpec as any).name).toBe('test-name');

      // delete temp spec file
      await rm(tempSpecFile, { force: true });
    });

    it('should throw error when bundle command fails', async () => {
      vi.mocked(getSpec).mockImplementationOnce(() =>
        Promise.reject(new Error('Bundle failed')),
      );

      // write temp spec file
      const specAsYaml = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      summary: Test endpoint
      responses:
        '200':
          description: A successful response
`;
      const tempSpecFile = join(
        process.cwd(),
        `temp-spec-${randomUUID()}.yaml`,
      );
      await writeFile(tempSpecFile, specAsYaml);

      await expect(() =>
        bundleAndDereferenceSpecFile({
          client: '@hey-api/client-fetch',
          outputPath: './output/dereferenced-spec.yaml',
          plugins: [],
          specPath: tempSpecFile,
        }),
      ).rejects.toThrow('Bundle failed');

      // delete temp spec file
      await rm(tempSpecFile, { force: true });
    });
  });

  describe('isUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('http://example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isUrl('not-a-url')).toBe(false);
    });

    it('should return false for file paths', () => {
      expect(isUrl('/path/to/spec.yaml')).toBe(false);
    });
  });

  describe('isAFile', () => {
    it('should return true for valid file paths', async () => {
      await writeFile('./spec.yaml', 'openapi: 3.0.0');
      expect(isAFile('./spec.yaml')).toBe(true);
      await rm('./spec.yaml');
    });

    it('should return false for valid URLs', () => {
      expect(isAFile('https://example.com')).toBe(false);
    });

    it('should return false for invalid file paths', () => {
      expect(isAFile('not-a-file')).toBe(false);
    });

    it('should fail if provided a url', () => {
      expect(isAFile('http://example.com')).toBe(false);
    });
  });
});
