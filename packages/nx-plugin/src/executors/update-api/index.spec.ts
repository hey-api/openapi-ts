import type { ExecutorContext } from '@nx/devkit';
import { describe, expect, it } from 'vitest';

import executor from '.';
import type { UpdateApiExecutorSchema } from './schema';

const options: UpdateApiExecutorSchema = {
  client: 'fetch',
  directory: 'libs',
  name: 'my-api',
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
    projects: {},
    version: 2,
  },
  root: '',
};

describe('UpdateApi Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
