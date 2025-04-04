import type { ExecutorContext } from '@nx/devkit';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { afterAll, describe, expect, it } from 'vitest';

import executor from '.';
import type { UpdateApiExecutorSchema } from './schema';

const options: UpdateApiExecutorSchema = {
  client: '@hey-api/client-fetch',
  // don't use tmp, as it is used internally in the lib code for temp files
  directory: 'temp-update-api',
  name: 'my-api',
  plugins: [],
  scope: '@my-org',
  spec: '',
};

const generateOptions = async (name: string) => {
  const apiDir = join(process.cwd(), options.directory, name, 'api');
  // Create the API directory and spec file
  if (!existsSync(apiDir)) {
    await mkdir(apiDir, { recursive: true });
  }
  const specPath = join(apiDir, 'spec.yaml');
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
  await writeFile(specPath, validSpec);
  return {
    ...options,
    name,
    spec: specPath,
  };
};

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
      'my-api': {
        root: 'libs/my-api',
        targets: {},
      },
    },
    version: 2,
  },
  root: '',
};

describe('UpdateApi Executor', () => {
  afterAll(async () => {
    const apiDir = join(process.cwd(), options.directory);
    if (existsSync(apiDir)) {
      await rm(apiDir, { force: true, recursive: true });
    }
  });

  it('can run', async () => {
    const testOptions = await generateOptions(options.name + '1');
    const output = await executor(testOptions, context);
    expect(output.success).toBe(true);
  });

  it('handles invalid spec file', async () => {
    const invalidOptions = await generateOptions(options.name + '2');
    const invalidSpecPath = join(
      process.cwd(),
      invalidOptions.directory,
      invalidOptions.name,
      'api',
      'invalid.yaml',
    );
    await mkdir(
      join(process.cwd(), invalidOptions.directory, invalidOptions.name, 'api'),
      { recursive: true },
    );
    await writeFile(invalidSpecPath, 'invalid: yaml');
    invalidOptions.spec = invalidSpecPath;

    const output = await executor(invalidOptions, context);
    expect(output.success).toBe(false);
  });

  it('handles non-existent spec file', async () => {
    const nonExistentOptions = await generateOptions(options.name + '3');
    nonExistentOptions.spec = 'non-existent.yaml';
    const output = await executor(nonExistentOptions, context);
    expect(output.success).toBe(false);
  });

  it('handles different client types', async () => {
    const axiosOptions = await generateOptions(options.name + '4');
    axiosOptions.client = '@hey-api/client-axios';
    const output = await executor(axiosOptions, context);
    expect(output.success).toBe(true);
  });

  it('handles plugins', async () => {
    const pluginOptions = await generateOptions(options.name + '5');
    pluginOptions.plugins = ['@tanstack/react-query'];
    const output = await executor(pluginOptions, context);
    expect(output.success).toBe(true);
  });

  it('handles identical specs', async () => {
    const identicalOptions = await generateOptions(options.name + '6');
    // Create a copy of the existing spec
    const existingSpecPath = join(
      process.cwd(),
      identicalOptions.directory,
      identicalOptions.name,
      'api',
      'spec.yaml',
    );
    const newSpecPath = join(
      process.cwd(),
      identicalOptions.directory,
      identicalOptions.name,
      'api',
      'new-spec.yaml',
    );
    const existingSpec = await readFile(existingSpecPath, 'utf-8');
    await mkdir(
      join(
        process.cwd(),
        identicalOptions.directory,
        identicalOptions.name,
        'api',
      ),
      { recursive: true },
    );
    await writeFile(newSpecPath, existingSpec);
    identicalOptions.spec = newSpecPath;

    const output = await executor(identicalOptions, context);
    expect(output.success).toBe(true);
  });

  it('handles different spec versions', async () => {
    const v2Options = await generateOptions(options.name + '7');
    const v2SpecPath = join(
      process.cwd(),
      v2Options.directory,
      v2Options.name,
      'api',
      'v2-spec.yaml',
    );
    const v2Spec = `
swagger: "2.0"
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
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
    await mkdir(
      join(process.cwd(), v2Options.directory, v2Options.name, 'api'),
      { recursive: true },
    );
    await writeFile(v2SpecPath, v2Spec);
    v2Options.spec = v2SpecPath;

    const output = await executor(v2Options, context);
    expect(output.success).toBe(true);
  });
});
