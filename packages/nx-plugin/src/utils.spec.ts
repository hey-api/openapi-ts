import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync } from 'node:fs';
import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import { getSpec, type initConfigs } from '@hey-api/openapi-ts/internal';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bundleAndDereferenceSpecFile,
  generateClientCode,
  generateClientCommand,
  getBaseTsConfigPath,
  getPackageName,
  getSpecFileVersion,
  getVersionOfPackage,
  isAFile,
  isUrl,
  removeExamples,
  standardizeSpec,
} from './utils';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  lstatSync: vi.fn(),
}));

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
      Promise.resolve({
        dependencies: [],
        results: [
          {
            config: {
              input: config?.input ?? 'default-input',
              output: config?.output ?? 'default-output',
              parser: {
                pagination: {
                  keywords: [
                    'after',
                    'before',
                    'cursor',
                    'offset',
                    'page',
                    'start',
                  ],
                },
                transforms: {
                  enums: {
                    case: 'PascalCase',
                    enabled: false,
                    mode: 'root',
                    name: (n: string) => n,
                  },
                  readWrite: {
                    enabled: false,
                  },
                },
                validate_EXPERIMENTAL: true,
              },
              plugins: config?.plugins ?? [],
            },
            errors: [],
          },
        ],
      }),
    ),
    parseOpenApiSpec: vi.fn(() => ({
      spec: {
        name: 'test-name',
      },
    })),
  };
});

vi.mock('@nx/devkit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();
  return {
    ...actual,
    workspaceRoot: '/',
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
        plugins: ['@hey-api/typescript', '@hey-api/sdk'],
        specFile: './api/spec.yaml',
      });

      expect(command).toBe(
        'npx @hey-api/openapi-ts -i ./api/spec.yaml -o ./src/generated -c @hey-api/client-fetch -p @hey-api/typescript -p @hey-api/sdk',
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
        'npx @hey-api/openapi-ts -i ./api/spec.yaml -o ./src/generated -c @hey-api/client-fetch -p @tanstack/react-query -p zod',
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
          plugins: ['@hey-api/typescript', '@hey-api/sdk'],
          specFile: './api/spec.yaml',
        }),
      ).resolves.not.toThrow();

      expect(createClient).toHaveBeenCalledWith({
        input: './api/spec.yaml',
        output: './src/generated',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/typescript',
          '@hey-api/sdk',
        ],
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
          plugins: ['@hey-api/typescript', '@hey-api/sdk'],
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
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(lstatSync).mockReturnValue({
        isDirectory: () => false,
        isFile: () => true,
      } as any);
      expect(isAFile('./spec.yaml')).toBe(true);
    });

    it('should return false for valid URLs', () => {
      expect(isAFile('https://example.com')).toBe(false);
    });

    it('should return false for invalid file paths', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      expect(isAFile('not-a-file')).toBe(false);
    });

    it('should fail if provided a url', () => {
      expect(isAFile('http://example.com')).toBe(false);
    });
  });

  describe('getBaseTsConfigPath', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('success when no baseTsConfigPath is provided', async () => {
      const projectRoot = '/path/to/project';
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => false } as any);
      const { tsConfigDirectory, tsConfigName } = await getBaseTsConfigPath({
        projectRoot,
      });
      expect(join(tsConfigDirectory)).toBe(join('../../..'));
      expect(tsConfigName).toBe('tsconfig.base.json');
    });

    it('success when no baseTsConfigPath is provided', async () => {
      const projectRoot = '/path/to/project';

      // fail first time
      vi.mocked(existsSync).mockReturnValueOnce(false);
      // then succeed
      vi.mocked(existsSync).mockReturnValueOnce(true);
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => false } as any);
      const { tsConfigDirectory, tsConfigName } = await getBaseTsConfigPath({
        projectRoot,
      });
      expect(join(tsConfigDirectory)).toBe(join('../../..'));
      expect(tsConfigName).toBe('tsconfig.json');
    });

    it('should return path when baseTsConfigPath is a file', async () => {
      const mockPath = '/path/to/tsconfig.json';
      const projectRoot = '/path/to/project';
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => false } as any);

      const { tsConfigDirectory, tsConfigName } = await getBaseTsConfigPath({
        baseTsConfigPath: mockPath,
        projectRoot,
      });
      expect(join(tsConfigDirectory)).toBe(join('..'));
      expect(tsConfigName).toBe('tsconfig.json');
    });

    it('should throw error when baseTsConfigPath is a file and baseTsConfigName is provided', async () => {
      const mockPath = '/path/to/tsconfig.json';
      const projectRoot = '/path/to/project';
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => false } as any);

      await expect(
        getBaseTsConfigPath({
          baseTsConfigName: 'tsconfig.json',
          baseTsConfigPath: mockPath,
          projectRoot,
        }),
      ).rejects.toThrow('Base tsconfig name');
    });

    it('should throw error when baseTsConfigPath file does not exist', async () => {
      const mockPath = '/path/to/tsconfig.json';
      const projectRoot = '/path/to/project';
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => false } as any);

      await expect(
        getBaseTsConfigPath({
          baseTsConfigPath: mockPath,
          projectRoot,
        }),
      ).rejects.toThrow('Base tsconfig file');
    });

    it('should throw error when baseTsConfigPath is neither file nor directory', async () => {
      const mockPath = '/path/to/invalid';
      const projectRoot = '/path/to/project';
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => false } as any);

      await expect(
        getBaseTsConfigPath({
          baseTsConfigPath: mockPath,
          projectRoot,
        }),
      ).rejects.toThrow('not a directory or a file');
    });

    it('should use workspaceRoot when baseTsConfigPath is a directory', async () => {
      const mockPath = '/path/to/dir';
      const projectRoot = '/path/to/project';
      const mockConfigName = 'tsconfig.test.json';
      vi.mocked(existsSync).mockImplementation(
        (path) => path === join(mockPath, mockConfigName),
      );
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => true } as any);

      const { tsConfigDirectory, tsConfigName } = await getBaseTsConfigPath({
        baseTsConfigName: mockConfigName,
        baseTsConfigPath: mockPath,
        projectRoot,
      });
      expect(join(tsConfigDirectory)).toBe(join('../dir'));
      expect(tsConfigName).toBe(mockConfigName);
    });

    it('should try default config names when no baseTsConfigName is provided', async () => {
      const mockPath = '/path/to/dir';
      const projectRoot = '/path/to/project';
      vi.mocked(existsSync).mockImplementation(
        (path) => path === join(mockPath, 'tsconfig.json'),
      );
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => true } as any);

      const { tsConfigDirectory, tsConfigName } = await getBaseTsConfigPath({
        baseTsConfigPath: mockPath,
        projectRoot,
      });
      expect(join(tsConfigDirectory)).toBe(join('../dir'));
      expect(tsConfigName).toBe('tsconfig.json');
    });

    it('should throw error when no config file is found', async () => {
      const mockPath = '/path/to/dir';
      const projectRoot = '/path/to/project';
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(lstatSync).mockReturnValue({ isDirectory: () => true } as any);

      await expect(
        getBaseTsConfigPath({
          baseTsConfigPath: mockPath,
          projectRoot,
        }),
      ).rejects.toThrow('Failed to find base tsconfig file');
    });
  });

  describe('removeExamples', () => {
    it('should remove examples from root level', () => {
      const schema = {
        example: 'single example',
        examples: ['example1', 'example2'],
        otherProperty: 'value',
      };

      const result = removeExamples(schema);
      expect(result).toEqual({
        otherProperty: 'value',
      });
    });

    it('should remove examples from nested objects', () => {
      const schema = {
        properties: {
          age: {
            example: 25,
            type: 'number' as const,
          },
          name: {
            examples: ['John', 'Jane'],
            type: 'string' as const,
          },
        },
      };

      const result = removeExamples(schema);
      expect(result).toEqual({
        properties: {
          age: {
            type: 'number',
          },
          name: {
            type: 'string',
          },
        },
      });
    });

    it('should remove examples from arrays of objects', () => {
      const schema = {
        items: [
          {
            examples: ['item1', 'item2'],
            type: 'string' as const,
          },
          {
            example: 42,
            type: 'number' as const,
          },
        ],
      };

      const result = removeExamples(schema);
      expect(result).toEqual({
        items: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      });
    });

    it('should handle empty objects', () => {
      const schema = {};
      const result = removeExamples(schema);
      expect(result).toEqual({});
    });

    it('should handle null values', () => {
      const schema = {
        examples: null,
        property: null,
      };

      const result = removeExamples(schema);
      expect(result).toEqual({
        property: null,
      });
    });

    it('should preserve other properties', () => {
      const schema = {
        properties: {
          name: {
            description: 'User name',
            type: 'string' as const,
          },
        },
        required: ['name'],
        type: 'object' as const,
      };

      const result = removeExamples(schema);
      expect(result).toEqual(schema);
    });
  });

  describe('standardizeSpec', () => {
    it('should return OpenAPI 3.0 spec unchanged', async () => {
      const spec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        openapi: '3.0.0',
        paths: {},
      };

      const result = await standardizeSpec(spec);
      expect(result).toEqual(spec);
    });

    it('should convert Swagger 2.0 spec to OpenAPI 3.0', async () => {
      const swaggerSpec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {
          '/test': {
            get: {
              summary: 'Test endpoint',
            },
          },
        },
        swagger: '2.0',
      };

      const convertedSpec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        openapi: '3.0.0',
        paths: {
          '/test': {
            get: {
              responses: {
                default: {
                  description: 'Default response',
                },
              },
              summary: 'Test endpoint',
            },
          },
        },
      };

      const result = await standardizeSpec(swaggerSpec);
      expect(result).toEqual(convertedSpec);
    });

    it('should handle OpenAPI 3.1 spec', async () => {
      const spec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        openapi: '3.1.0',
        paths: {},
      };

      const result = await standardizeSpec(spec);
      expect(result).toEqual(spec);
    });

    it('should throw error for invalid spec version', async () => {
      const spec = {
        // Invalid: not a string
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        openapi: 3.0,
        paths: {},
      };

      await expect(standardizeSpec(spec)).rejects.toThrow(
        'Spec file openapi version is not a string',
      );
    });
  });

  describe('getSpecFileVersion', () => {
    it('should return OpenAPI version when present', () => {
      const spec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        openapi: '3.0.0',
      };

      const version = getSpecFileVersion(spec);
      expect(version).toBe('3.0.0');
    });

    it('should return Swagger version when present', () => {
      const spec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        swagger: '2.0',
      };

      const version = getSpecFileVersion(spec);
      expect(version).toBe('2.0');
    });

    it('should throw error when OpenAPI version is not a string', () => {
      const spec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        openapi: 3.0,
      };

      expect(() => getSpecFileVersion(spec)).toThrow(
        'Spec file openapi version is not a string',
      );
    });

    it('should throw error when Swagger version is not a string', () => {
      const spec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        swagger: 2.0,
      };

      expect(() => getSpecFileVersion(spec)).toThrow(
        'Spec file swagger version is not a string',
      );
    });

    it('should throw error when neither OpenAPI nor Swagger version is present', () => {
      const spec = {
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
      };

      expect(() => getSpecFileVersion(spec)).toThrow(
        'Spec file does not contain an openapi or swagger version',
      );
    });
  });
});
