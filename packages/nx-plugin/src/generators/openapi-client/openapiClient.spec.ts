import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import type { initConfigs } from '@hey-api/openapi-ts/internal';
import { readJson } from '@nx/devkit';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { getGeneratorOptions } from '../../test-utils';
import { generateClientCode } from '../../utils';
import generator, { updateTsConfig } from './openapiClient';
import {
  generateApi,
  generateNxProject,
  normalizeOptions,
  updatePackageJson,
} from './openapiClient';

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
    initConfigs: vi.fn((config: Parameters<typeof initConfigs>[0]) =>
      Promise.resolve([
        {
          input: config?.input ?? 'default-input',
          output: config?.output ?? 'default-output',
          plugins: config?.plugins ?? [],
        },
      ]),
    ),
  };
});

vi.mock('latest-version', () => ({
  default: vi.fn(() => '1.0.0'),
}));

const tempDirectory = `temp-openapi-client-${randomUUID()}`;

describe('openapi-client generator', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
  });

  afterAll(() => {
    try {
      const tempDir = join(process.cwd(), tempDirectory);
      if (existsSync(tempDir)) {
        rmSync(tempDir, { force: true, recursive: true });
      }
    } catch (error) {
      console.error(error);
    }

    vi.resetAllMocks();
  });

  describe('normalizeOptions', () => {
    it('should normalize options with default values', async () => {
      const uuid = randomUUID();
      const { options, specPath } = await getGeneratorOptions({
        name: `test-api-${uuid}`,
        tempDirectory,
      });
      const normalized = normalizeOptions(options);

      expect(normalized).toEqual({
        clientType: '@hey-api/client-fetch',
        isPrivate: true,
        plugins: [],
        projectDirectory: `${tempDirectory}/test-api-${uuid}`,
        projectName: 'test-api',
        projectRoot: `${tempDirectory}/test-api-${uuid}/test-api`,
        projectScope: '@test-api',
        specFile: specPath,
        tagArray: ['api', 'openapi'],
        tempFolder: options.tempFolderDir,
        test: 'none',
      });
    });

    it('should normalize options with custom directory and tags', async () => {
      const { options, specPath } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });

      const customOptions = {
        ...options,
        directory: 'custom-dir',
        tags: ['custom', 'tags'],
      };

      const normalized = normalizeOptions(customOptions);

      expect(normalized).toEqual({
        clientType: '@hey-api/client-fetch',
        isPrivate: true,
        plugins: [],
        projectDirectory: 'custom-dir',
        projectName: 'test-api',
        projectRoot: 'custom-dir/test-api',
        projectScope: '@test-api',
        specFile: specPath,
        tagArray: ['custom', 'tags'],
        tempFolder: options.tempFolderDir,
        test: 'none',
      });
    });
  });

  describe('generateNxProject', () => {
    it('should generate project configuration', async () => {
      const { options, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);

      await generateNxProject({ clientPlugins: {}, normalizedOptions, tree });

      const config = readJson(
        tree,
        `${normalizedOptions.projectRoot}/project.json`,
      );
      expect(config).toBeDefined();
      expect(config.projectType).toBe('library');
      expect(config.targets.build).toBeDefined();
      expect(config.targets.generateApi).toBeDefined();
    });

    it('should generate project files', async () => {
      const { options, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);

      await generateNxProject({ clientPlugins: {}, normalizedOptions, tree });

      expect(
        tree.exists(`${normalizedOptions.projectRoot}/tsconfig.json`),
      ).toBeTruthy();
      expect(
        tree.exists(`${normalizedOptions.projectRoot}/tsconfig.lib.json`),
      ).toBeTruthy();
      expect(
        tree.exists(`${normalizedOptions.projectRoot}/package.json`),
      ).toBeTruthy();
      expect(
        tree.exists(`${normalizedOptions.projectRoot}/README.md`),
      ).toBeTruthy();
    });
  });

  describe('generateApi', () => {
    it('should process and bundle the OpenAPI spec file', async () => {
      const { options, specPath, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);
      const { projectRoot } = normalizedOptions;

      await generateApi({
        client: '@hey-api/client-fetch',
        plugins: [],
        projectRoot,
        specFile: specPath,
        tempFolder: tempDirectory,
        tree,
      });

      expect(tree.exists(`${projectRoot}/api/spec.yaml`)).toBeTruthy();
    });

    it('should throw error for invalid spec file', async () => {
      const { options, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);
      const { projectRoot } = normalizedOptions;

      await expect(
        generateApi({
          client: '@hey-api/client-fetch',
          plugins: [],
          projectRoot,
          specFile: 'non-existent.yaml',
          tempFolder: tempDirectory,
          tree,
        }),
      ).rejects.toThrow();
    });
  });

  describe('updatePackageJson', () => {
    it('should update package.json with correct dependencies', async () => {
      const { options, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);
      const { projectName, projectRoot, projectScope } = normalizedOptions;

      // Create initial package.json
      tree.write(
        `${projectRoot}/package.json`,
        JSON.stringify({
          dependencies: {},
          devDependencies: {},
          name: `${projectScope}/${projectName}`,
        }),
      );

      // Create tsconfig.base.json
      tree.write(
        'tsconfig.base.json',
        JSON.stringify({
          compilerOptions: {
            paths: {},
          },
        }),
      );

      await updatePackageJson({
        clientType: '@hey-api/client-fetch',
        isPrivate: true,
        plugins: [],
        projectRoot,
        tree,
      });

      const packageJson = readJson(tree, `${projectRoot}/package.json`);
      expect(packageJson.dependencies['@hey-api/client-fetch']).toBeDefined();
    });

    it('should update tsconfig with correct dependencies', async () => {
      const { options, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);
      const { projectName, projectRoot, projectScope } = normalizedOptions;

      // Create tsconfig.base.json
      tree.write(
        'tsconfig.base.json',
        JSON.stringify({
          compilerOptions: {
            paths: {},
          },
        }),
      );

      updateTsConfig({
        clientPlugins: {
          '@tanstack/react-query': {
            tsConfigCompilerPaths: {
              'my-test-path': './src/index.ts',
            },
          },
        },
        projectName,
        projectRoot,
        projectScope,
        tree,
      });

      // Verify tsconfig.base.json was updated
      const tsconfig = readJson(tree, 'tsconfig.base.json');
      expect(
        tsconfig.compilerOptions.paths[`${projectScope}/${projectName}`],
      ).toBeDefined();
      expect(tsconfig.compilerOptions.paths['my-test-path']).toBeDefined();
    });

    it('should update package.json with axios dependencies when clientType is axios', async () => {
      const { options, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);
      const { projectName, projectRoot, projectScope } = normalizedOptions;

      // Create initial package.json
      tree.write(
        `${projectRoot}/package.json`,
        JSON.stringify({
          dependencies: {},
          devDependencies: {},
          name: `${projectScope}/${projectName}`,
        }),
      );

      await updatePackageJson({
        clientType: '@hey-api/client-axios',
        isPrivate: true,
        plugins: [],
        projectRoot,
        tree,
      });

      const packageJson = readJson(tree, `${projectRoot}/package.json`);
      expect(packageJson.dependencies.axios).toBeDefined();
    });
  });

  describe('generateClientCode', () => {
    it('should generate client code without errors', async () => {
      const { options, specPath } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      const normalizedOptions = normalizeOptions(options);
      const { clientType, plugins, projectRoot } = normalizedOptions;

      // Create necessary directories
      const fullProjectRoot = join(process.cwd(), projectRoot);
      if (!existsSync(fullProjectRoot)) {
        mkdirSync(fullProjectRoot, { recursive: true });
      }

      await expect(
        generateClientCode({
          clientType,
          outputPath: `${projectRoot}/src/generated`,
          plugins,
          specFile: specPath,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('full generator', () => {
    it('should run the full generator successfully', async () => {
      const { options, tree } = await getGeneratorOptions({
        name: `test-api-${randomUUID()}`,
        tempDirectory,
      });
      await generator(tree, options);

      // Verify project structure
      const normalizedOptions = normalizeOptions(options);
      const { projectRoot } = normalizedOptions;

      expect(tree.exists(`${projectRoot}/package.json`)).toBeTruthy();
      expect(tree.exists(`${projectRoot}/tsconfig.json`)).toBeTruthy();
      expect(tree.exists(`${projectRoot}/api/spec.yaml`)).toBeTruthy();
    });
  });
});
