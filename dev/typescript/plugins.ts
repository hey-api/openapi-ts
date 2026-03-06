import type { UserConfig } from '@hey-api/openapi-ts';

export type PluginConfig = NonNullable<NonNullable<UserConfig['plugins']>[number]>;

export function typescript(
  options?: Omit<Extract<PluginConfig, { name: '@hey-api/typescript' }>, 'name'>,
): Extract<PluginConfig, { name: '@hey-api/typescript' }> {
  return {
    name: '@hey-api/typescript',
    ...options,
  };
}

export function sdk(
  options?: Omit<Extract<PluginConfig, { name: '@hey-api/sdk' }>, 'name'>,
): Extract<PluginConfig, { name: '@hey-api/sdk' }> {
  return {
    name: '@hey-api/sdk',
    ...options,
  };
}

export function zod(
  options?: Omit<Extract<PluginConfig, { name: 'zod' }>, 'name'>,
): Extract<PluginConfig, { name: 'zod' }> {
  return {
    name: 'zod',
    ...options,
  };
}

export function valibot(
  options?: Omit<Extract<PluginConfig, { name: 'valibot' }>, 'name'>,
): Extract<PluginConfig, { name: 'valibot' }> {
  return {
    name: 'valibot',
    ...options,
  };
}

export function tanstackReactQuery(
  options?: Omit<Extract<PluginConfig, { name: '@tanstack/react-query' }>, 'name'>,
): Extract<PluginConfig, { name: '@tanstack/react-query' }> {
  return {
    name: '@tanstack/react-query',
    ...options,
  };
}

export function transformers(
  options?: Omit<Extract<PluginConfig, { name: '@hey-api/transformers' }>, 'name'>,
): Extract<PluginConfig, { name: '@hey-api/transformers' }> {
  return {
    name: '@hey-api/transformers',
    ...options,
  };
}
