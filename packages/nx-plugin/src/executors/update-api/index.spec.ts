import type { initConfigs } from '@hey-api/openapi-ts';
import { type ExecutorContext, logger } from '@nx/devkit';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { afterAll, describe, expect, it, vi } from 'vitest';

import generator from '../../generators/openapi-client';
import { getGeneratorOptions, TestOptions } from '../../test-utils';
import { CONSTANTS } from '../../vars';
import executor from '.';
import type { UpdateApiExecutorSchema } from './schema';

vi.mock('@hey-api/openapi-ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hey-api/openapi-ts')>();
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

const tempDirectory = `temp-update-api-${randomUUID()}`;

const defaultOptions: UpdateApiExecutorSchema = {
  client: TestOptions.client,
  // don't use tmp, as it is used internally in the lib code for temp files
  directory: tempDirectory,
  name: TestOptions.name,
  plugins: [],
  scope: TestOptions.scope,
  spec: '',
  tempFolder: tempDirectory,
};

const testSpecName = 'spec.yaml';

const getExecutorOptions = async (name: string) => {
  const projectDir = join(defaultOptions.directory, name);
  const apiDir = join(projectDir, 'api');
  // Create the API directory and spec file
  const absoluteApiDir = join(process.cwd(), apiDir);
  if (!existsSync(absoluteApiDir)) {
    await mkdir(absoluteApiDir, { recursive: true });
  }
  const specPath = join(apiDir, testSpecName);
  const absoluteSpecPath = join(process.cwd(), specPath);
  const validSpec = `
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
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
`;
  logger.debug(`Writing executor spec to ${absoluteSpecPath}`);
  await writeFile(absoluteSpecPath, validSpec);

  const context: ExecutorContext = {
    cwd: process.cwd(),
    isVerbose: false,
    nxJsonConfiguration: {},
    projectGraph: {
      dependencies: {},
      nodes: {},
    },
    projectsConfigurations: {
      projects: {
        [TestOptions.name]: {
          root: projectDir,
          targets: {},
        },
      },
      version: 2,
    },
    root: '',
  };

  return {
    context,
    options: {
      ...defaultOptions,
      directory: tempDirectory,
      name,
      spec: specPath,
    },
  };
};

describe('UpdateApi Executor', () => {
  afterAll(async () => {
    const apiDir = join(process.cwd(), tempDirectory);
    if (existsSync(apiDir)) {
      await rm(apiDir, { force: true, recursive: true });
    }
  });

  it('can run', async () => {
    const { context, options } = await getExecutorOptions(
      defaultOptions.name + `-${randomUUID()}`,
    );
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });

  it('handles invalid spec file', async () => {
    const { context, options } = await getExecutorOptions(
      defaultOptions.name + `-${randomUUID()}`,
    );
    const invalidSpecPath = join(
      process.cwd(),
      options.directory,
      options.name,
      'api',
      'invalid.yaml',
    );
    await mkdir(join(process.cwd(), options.directory, options.name, 'api'), {
      recursive: true,
    });
    await writeFile(invalidSpecPath, 'invalid: yaml');
    options.spec = invalidSpecPath;

    const output = await executor(options, context);
    expect(output.success).toBe(false);
  });

  it('handles non-existent spec file', async () => {
    const { context, options } = await getExecutorOptions(
      defaultOptions.name + `-${randomUUID()}`,
    );
    options.spec = 'non-existent.yaml';
    const output = await executor(options, context);
    expect(output.success).toBe(false);
  });

  it('handles different client types', async () => {
    const { context, options } = await getExecutorOptions(
      defaultOptions.name + `-${randomUUID()}`,
    );
    options.client = '@hey-api/client-axios';
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });

  it('handles plugins', async () => {
    const { context, options } = await getExecutorOptions(
      defaultOptions.name + `-${randomUUID()}`,
    );
    options.plugins = ['@tanstack/react-query'];
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });

  it('handles identical specs', async () => {
    const { context, options } = await getExecutorOptions(
      defaultOptions.name + `-${randomUUID()}`,
    );
    // Create a copy of the existing spec
    const existingSpecPath = join(
      process.cwd(),
      options.tempFolder ?? '',
      options.name,
      CONSTANTS.SPEC_DIR_NAME,
      testSpecName,
    );
    const newSpecPath = join(
      process.cwd(),
      options.tempFolder ?? '',
      options.name,
      CONSTANTS.SPEC_DIR_NAME,
      'new-spec.yaml',
    );
    const existingSpec = await readFile(existingSpecPath, 'utf-8');
    await mkdir(
      join(
        process.cwd(),
        options.directory,
        options.name,
        CONSTANTS.SPEC_DIR_NAME,
      ),
      {
        recursive: true,
      },
    );
    await writeFile(newSpecPath, existingSpec);
    options.spec = newSpecPath;

    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });

  it('handles different spec versions', async () => {
    const {
      options: generatorOptions,
      specPath,
      tree,
    } = await getGeneratorOptions({
      name: defaultOptions.name + `-${randomUUID()}`,
      tempDirectory,
    });
    const { context, options } = await getExecutorOptions(
      generatorOptions.name,
    );

    // Update the executor spec path to the spec path from the generator
    options.spec = specPath;

    const absoluteApiDir = join(
      process.cwd(),
      options.tempFolder ?? '',
      options.name,
      CONSTANTS.SPEC_DIR_NAME,
    );
    const v2SpecPath = join(process.cwd(), specPath);
    const v2Spec = `
swagger: "2.0"
info:
  title: Test API
  version: 1.0.0
paths:
  /test2:
    get:
      responses:
        '200':
          description: OK
          schema:
            type: object
            properties:
              message:
                type: string
`;
    await generator(tree, generatorOptions);

    await mkdir(absoluteApiDir, {
      recursive: true,
    });
    if (existsSync(v2SpecPath)) {
      logger.debug(`Spec file already exists: ${v2SpecPath}`);
      await writeFile(v2SpecPath, v2Spec);
    } else {
      logger.error(`Spec file does not exist: ${v2SpecPath}`);
      throw new Error(`Spec file does not exist: ${v2SpecPath}`);
    }

    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
