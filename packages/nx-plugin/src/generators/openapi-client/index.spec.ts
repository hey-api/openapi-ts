import type { Tree } from '@nx/devkit';
import { readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { rm } from 'fs/promises';
import { dirname, join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateClientCode } from '../../utils';
import type { OpenApiClientGeneratorSchema } from './index';
import generator from './index';
import {
  generateApi,
  generateNxProject,
  normalizeOptions,
  updatePackageJson,
} from './index';

// Mock execSync to prevent actual command execution
vi.mock('child_process', () => ({
  execSync: vi.fn((command: string) => {
    // Mock successful bundling by copying the spec file
    if (command.includes('redocly bundle')) {
      const args = command.split(' ');
      const specFileIndex = args.indexOf('bundle') + 1;
      const outputFileIndex = args.indexOf('--output') + 1;

      if (specFileIndex > 0 && outputFileIndex > 0) {
        const specFile = args[specFileIndex];
        const outputFile = args[outputFileIndex];

        if (!specFile || !existsSync(specFile)) {
          throw new Error(
            `ENOENT: no such file or directory, open '${specFile}'`,
          );
        }

        if (!outputFile) {
          throw new Error(
            `ENOENT: no such file or directory, open '${outputFile}'`,
          );
        }

        const content = readFileSync(specFile, 'utf-8');
        mkdirSync(dirname(outputFile), { recursive: true });
        writeFileSync(outputFile, content);
      }
      return '';
    }
    return '';
  }),
}));

// Mock generateClientCode to prevent actual code generation
vi.mock('../../utils', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = (await vi.importActual('./index')) as typeof import('./index');
  return {
    ...actual,
    generateClientCode: vi.fn(),
  };
});

const tempDir = 'temp';

describe('openapi-client generator', () => {
  let tree: Tree;
  let tempSpecPath: string;

  const options = {
    client: '@hey-api/client-fetch',
    directory: tempDir,
    name: 'test-api',
    plugins: [],
    scope: '@test-api',
    spec: '',
  } satisfies OpenApiClientGeneratorSchema;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    // Create a mock spec file in the workspace
    const mockSpecContent = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        '200':
          description: OK
    `;

    // Create temp directory in the workspace root
    const tempDir = join(process.cwd(), 'tmp');
    const apiDir = join(tempDir, 'api');
    if (!existsSync(apiDir)) {
      mkdirSync(apiDir, { recursive: true });
    }

    // Write the spec file
    tempSpecPath = join(apiDir, 'test-spec.yaml');
    writeFileSync(tempSpecPath, mockSpecContent);

    // Update options with the correct spec file path
    options.spec = tempSpecPath;

    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    const tempDir = join(process.cwd(), 'tmp');
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true });
    }
  });

  describe('normalizeOptions', () => {
    it('should normalize options with default values', () => {
      const normalized = normalizeOptions(options);

      expect(normalized).toEqual({
        clientType: '@hey-api/client-fetch',
        plugins: [],
        projectDirectory: tempDir,
        projectName: 'test-api',
        projectRoot: `${tempDir}/test-api`,
        projectScope: '@test-api',
        specFile: tempSpecPath,
        tagArray: ['api', 'openapi'],
      });
    });

    it('should normalize options with custom directory and tags', () => {
      const customOptions = {
        ...options,
        directory: 'custom-dir',
        tags: 'custom,tags',
      };

      const normalized = normalizeOptions(customOptions);

      expect(normalized).toEqual({
        clientType: '@hey-api/client-fetch',
        plugins: [],
        projectDirectory: 'custom-dir',
        projectName: 'test-api',
        projectRoot: 'custom-dir/test-api',
        projectScope: '@test-api',
        specFile: tempSpecPath,
        tagArray: ['custom', 'tags'],
      });
    });
  });

  describe('generateNxProject', () => {
    it('should generate project configuration', () => {
      const normalizedOptions = normalizeOptions(options);

      generateNxProject({ clientPlugins: {}, normalizedOptions, tree });

      const config = readJson(
        tree,
        `${normalizedOptions.projectRoot}/project.json`,
      );
      expect(config).toBeDefined();
      expect(config.projectType).toBe('library');
      expect(config.targets.build).toBeDefined();
      expect(config.targets.generateApi).toBeDefined();
    });

    it('should generate project files', () => {
      const normalizedOptions = normalizeOptions(options);

      generateNxProject({ clientPlugins: {}, normalizedOptions, tree });

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
      const normalizedOptions = normalizeOptions(options);
      const { projectRoot } = normalizedOptions;

      await generateApi({
        projectRoot,
        specFile: tempSpecPath,
        tree,
      });

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining(`redocly bundle ${tempSpecPath}`),
        expect.any(Object),
      );
      expect(tree.exists(`${projectRoot}/api/spec.yaml`)).toBeTruthy();
    });

    it('should throw error for invalid spec file', async () => {
      const normalizedOptions = normalizeOptions(options);
      const { projectRoot } = normalizedOptions;

      await expect(
        generateApi({
          projectRoot,
          specFile: 'non-existent.yaml',
          tree,
        }),
      ).rejects.toThrow();
    });
  });

  describe('updatePackageJson', () => {
    it('should update package.json with correct dependencies', async () => {
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
        clientPlugins: {},
        clientType: '@hey-api/client-fetch',
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

      const packageJson = readJson(tree, `${projectRoot}/package.json`);
      expect(packageJson.dependencies['@hey-api/client-fetch']).toBeDefined();
    });

    it('should update package.json with correct dependencies', async () => {
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
        clientPlugins: {
          '@tanstack/react-query': {
            tsConfigCompilerPaths: {
              'my-test-path': './src/index.ts',
            },
          },
        },
        clientType: '@hey-api/client-fetch',
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
        clientPlugins: {},
        clientType: '@hey-api/client-axios',
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

      const packageJson = readJson(tree, `${projectRoot}/package.json`);
      expect(packageJson.dependencies.axios).toBeDefined();
    });
  });

  describe('generateClientCode', () => {
    it('should generate client code without errors', () => {
      const normalizedOptions = normalizeOptions(options);
      const { clientType, plugins, projectRoot } = normalizedOptions;

      // Create necessary directories
      const fullProjectRoot = join(process.cwd(), projectRoot);
      if (!existsSync(fullProjectRoot)) {
        mkdirSync(fullProjectRoot, { recursive: true });
      }

      expect(() =>
        generateClientCode({
          clientType,
          outputPath: `${projectRoot}/src/generated`,
          plugins,
          specFile: tempSpecPath,
        }),
      ).not.toThrow();
    });
  });

  describe('full generator', () => {
    it('should run the full generator successfully', async () => {
      const task = await generator(tree, options);
      expect(task).toBeDefined();

      // Verify project structure
      const normalizedOptions = normalizeOptions(options);
      const { projectRoot } = normalizedOptions;

      expect(tree.exists(`${projectRoot}/package.json`)).toBeTruthy();
      expect(tree.exists(`${projectRoot}/tsconfig.json`)).toBeTruthy();
      expect(tree.exists(`${projectRoot}/api/spec.yaml`)).toBeTruthy();

      // Verify the generator was called with correct parameters
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining(`redocly bundle ${tempSpecPath}`),
        expect.any(Object),
      );
    });
  });
});
