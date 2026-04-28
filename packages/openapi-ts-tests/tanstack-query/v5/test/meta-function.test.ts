import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

import { getFilePaths } from '../../../utils';
import { snapshotsDir, tmpDir } from './constants';
import { createConfigFactory } from './utils';

const version = '3.1.x';
const namespace = 'meta-function';

const outputDir = path.join(tmpDir, version, namespace);

describe('TanStack Query Meta Function Customization', () => {
  const createConfig = createConfigFactory({
    openApiVersion: version,
    outputDir,
  });

  const frameworks = [
    {
      description: 'React Query',
      name: '@tanstack/react-query',
      output: 'react-query',
    },
    {
      description: 'Vue Query',
      name: '@tanstack/vue-query',
      output: 'vue-query',
    },
    {
      description: 'Svelte Query',
      name: '@tanstack/svelte-query',
      output: 'svelte-query',
    },
    {
      description: 'Solid Query',
      name: '@tanstack/solid-query',
      output: 'solid-query',
    },
    {
      description: 'Angular Query',
      name: '@tanstack/angular-query-experimental',
      output: 'angular-query-experimental',
    },
    {
      description: 'Preact Query',
      name: '@tanstack/preact-query',
      output: 'preact-query',
    },
  ] as const;

  const scenarios = frameworks.map((framework) => ({
    config: createConfig({
      input: 'security-api-key.yaml',
      output: framework.output,
      plugins: [
        {
          infiniteQueryOptions: {
            meta: (operation) => ({
              id: operation.id,
              method: operation.method,
              path: operation.path,
            }),
          },
          mutationOptions: {
            meta: (operation) => ({
              id: operation.id,
              method: operation.method,
              path: operation.path,
            }),
          },
          name: framework.name,
          queryOptions: {
            meta: (operation) => ({
              id: operation.id,
              method: operation.method,
              path: operation.path,
            }),
          },
        },
        '@hey-api/client-fetch',
      ],
    }),
    description: `generates ${framework.description} options with custom meta function`,
  }));

  it.each(scenarios)('$description', async ({ config }) => {
    await createClient(config);

    const outputPath = config.output as string;
    const filePaths = getFilePaths(outputPath);

    await Promise.all(
      filePaths.map(async (filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        await expect(fileContent).toMatchFileSnapshot(
          path.join(snapshotsDir, version, namespace, filePath.slice(outputDir.length + 1)),
        );
      }),
    );
  });
});
