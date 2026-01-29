import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';

import { getFilePaths, getSpecsPath } from '../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.1.x';
const namespace = 'plugins';
const outputDir = path.join(__dirname, 'generated', version, namespace);

// TODO: further clean up
describe('TanStack Query Meta Function Customization', () => {
  const createConfig = (
    userConfig: Omit<UserConfig, 'input'> & Pick<Partial<UserConfig>, 'input'>,
  ): UserConfig => ({
    input: path.join(getSpecsPath(), version, 'security-api-key.yaml'),
    logs: {
      level: 'silent',
    },
    ...userConfig,
  });

  // Framework configurations
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
  ] as const;

  // Generate scenarios for each framework
  const scenarios = frameworks.map((framework) => ({
    config: createConfig({
      output: path.join(outputDir, '@tanstack', framework.output, 'meta-function'),
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

    // Create snapshots for all generated files
    await Promise.all(
      filePaths.map(async (filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const relativePath = filePath.slice(outputPath.length + 1);
        const fileName = path.basename(relativePath);
        const frameworkDir = path.dirname(relativePath).split(path.sep).pop()!;
        await expect(fileContent).toMatchFileSnapshot(
          path.join(
            __dirname,
            '..',
            '..',
            '__snapshots__',
            'plugins',
            '@tanstack',
            'meta',
            frameworkDir,
            fileName,
          ),
        );
      }),
    );
  });
});
