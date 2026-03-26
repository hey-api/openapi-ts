import type { UserConfig } from '@hey-api/openapi-ts';

export type PluginConfig = NonNullable<NonNullable<UserConfig['plugins']>[number]>;

export const presets = {
  angular: () => [
    /** Angular HttpClient with typed services */
    {
      httpRequests: 'flat',
      name: '@angular/common',
    },
  ],
  full: () => [
    /** Full kitchen sink for comprehensive testing */
    {
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/sdk',
      paramsStructure: 'flat',
    },
    {
      name: '@hey-api/transformers',
    },
    {
      metadata: true,
      name: 'zod',
    },
    {
      name: '@tanstack/react-query',
      queryKeys: {
        tags: true,
      },
    },
  ],
  msw: () => [
    /** SDK + MSW handlers */
    {
      name: '@hey-api/sdk',
      operations: {
        containerName: 'OpenCode',
        strategy: 'single',
      },
      paramsStructure: 'flat',
    },
    {
      name: 'msw',
    },
  ],
  rpc: () => [
    /** RPC-style SDK with Zod validation */
    'orpc',
    'zod',
  ],
  sdk: () => [
    /** SDK with types */
    {
      name: '@hey-api/sdk',
      operations: {
        containerName: 'OpenCode',
        strategy: 'single',
      },
      paramsStructure: 'flat',
    },
  ],
  tanstack: () => [
    /** SDK + TanStack Query */
    {
      name: '@tanstack/react-query',
      queryKeys: {
        tags: true,
      },
    },
  ],
  types: () => [
    /** Just types, nothing else */
    '@hey-api/typescript',
  ],
  validated: () => [
    /** SDK + Zod validation */
    {
      name: '@hey-api/sdk',
      validator: 'zod',
    },
    {
      metadata: true,
      name: 'valibot',
    },
    {
      metadata: true,
      name: 'zod',
    },
  ],
} as const satisfies Record<string, () => ReadonlyArray<PluginConfig>>;

export type PresetKey = keyof typeof presets;

export function getPreset(key: PresetKey = (process.env.PRESET as PresetKey) || 'sdk') {
  const preset = presets[key];
  if (!preset) {
    throw new Error(`Unknown preset: ${key}. Available: ${Object.keys(presets).join(', ')}`);
  }
  return preset();
}
