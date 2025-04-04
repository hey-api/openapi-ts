import type { ExecutorContext } from '@nx/devkit';
import { existsSync } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import executor from '.';
import type { UpdateApiExecutorSchema } from './schema';

const options: UpdateApiExecutorSchema = {
  client: 'fetch',
  // don't use tmp, as it is used internally in the lib code for temp files
  directory: 'temp',
  name: 'my-api',
  plugins: [],
  scope: '@my-org',
  spec: '',
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
  beforeEach(async () => {
    // Create the API directory and spec file
    const apiDir = join(process.cwd(), options.directory, options.name, 'api');
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
    options.spec = specPath;
  });

  afterEach(async () => {
    const apiDir = join(process.cwd(), options.directory);
    if (existsSync(apiDir)) {
      await rm(apiDir, { force: true, recursive: true });
    }
  });

  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
