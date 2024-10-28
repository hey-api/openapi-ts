import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { UserConfig } from '../src/types/config';
import { getFilePaths } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = 'plugins';

const outputDir = path.join(__dirname, 'generated', VERSION);

describe(VERSION, () => {
  const createConfig = (
    userConfig: Omit<UserConfig, 'input'> &
      Pick<Required<UserConfig>, 'plugins'>,
  ): UserConfig => ({
    client: '@hey-api/client-fetch',
    experimentalParser: true,
    ...userConfig,
    input: path.join(__dirname, 'spec', '3.1.0', 'full.json'),
    output: path.join(
      outputDir,
      typeof userConfig.plugins[0] === 'string'
        ? userConfig.plugins[0]
        : userConfig.plugins[0].name,
      typeof userConfig.output === 'string' ? userConfig.output : '',
    ),
  });

  const scenarios = [
    {
      config: createConfig({
        output: 'fetch',
        plugins: ['@tanstack/react-query'],
      }),
      description: 'generate Fetch API client with TanStack React Query plugin',
    },
    {
      config: createConfig({
        output: 'fetch',
        plugins: ['@tanstack/solid-query'],
      }),
      description: 'generate Fetch API client with TanStack Solid Query plugin',
    },
    {
      config: createConfig({
        output: 'fetch',
        plugins: ['@tanstack/svelte-query'],
      }),
      description:
        'generate Fetch API client with TanStack Svelte Query plugin',
    },
    {
      config: createConfig({
        output: 'fetch',
        plugins: ['@tanstack/vue-query'],
      }),
      description: 'generate Fetch API client with TanStack Vue Query plugin',
    },
    {
      config: createConfig({
        client: '@hey-api/client-axios',
        output: 'axios',
        plugins: ['@tanstack/react-query'],
      }),
      description: 'generate Axios client with TanStack React Query plugin',
    },
    {
      config: createConfig({
        client: '@hey-api/client-axios',
        output: 'axios',
        plugins: ['@tanstack/solid-query'],
      }),
      description: 'generate Axios client with TanStack Solid Query plugin',
    },
    {
      config: createConfig({
        client: '@hey-api/client-axios',
        output: 'axios',
        plugins: ['@tanstack/svelte-query'],
      }),
      description: 'generate Axios client with TanStack Svelte Query plugin',
    },
    {
      config: createConfig({
        client: '@hey-api/client-axios',
        output: 'axios',
        plugins: ['@tanstack/vue-query'],
      }),
      description: 'generate Axios client with TanStack Vue Query plugin',
    },
    {
      config: createConfig({
        output: 'asClass',
        plugins: [
          '@tanstack/react-query',
          {
            asClass: true,
            name: '@hey-api/services',
          },
        ],
      }),
      description:
        'generate Fetch API client with TanStack React Query plugin using class-based services',
    },
    {
      config: createConfig({
        output: 'asClass',
        plugins: [
          '@tanstack/solid-query',
          {
            asClass: true,
            name: '@hey-api/services',
          },
        ],
      }),
      description:
        'generate Fetch API client with TanStack Solid Query plugin using class-based services',
    },
    {
      config: createConfig({
        output: 'asClass',
        plugins: [
          '@tanstack/svelte-query',
          {
            asClass: true,
            name: '@hey-api/services',
          },
        ],
      }),
      description:
        'generate Fetch API client with TanStack Svelte Query plugin using class-based services',
    },
    {
      config: createConfig({
        output: 'asClass',
        plugins: [
          '@tanstack/vue-query',
          {
            asClass: true,
            name: '@hey-api/services',
          },
        ],
      }),
      description:
        'generate Fetch API client with TanStack Vue Query plugin using class-based services',
    },
  ];

  it.each(scenarios)('$description', async ({ config }) => {
    // @ts-ignore
    await createClient(config);

    const outputPath = typeof config.output === 'string' ? config.output : '';
    const filePaths = getFilePaths(outputPath);

    filePaths.forEach((filePath) => {
      const fileContent = readFileSync(filePath, 'utf-8');
      expect(fileContent).toMatchFileSnapshot(
        path.join(
          __dirname,
          '__snapshots__',
          VERSION,
          filePath.slice(outputDir.length + 1),
        ),
      );
    });
  });
});
