import type { UserConfig } from '@hey-api/openapi-ts';

type PluginConfig = NonNullable<NonNullable<UserConfig['plugins']>[number]>;

export function typescript(
  options?: Partial<
    Omit<Extract<PluginConfig, { name: '@hey-api/typescript' }>, 'name'>
  >,
) {
  return {
    name: '@hey-api/typescript' as const,
    ...options,
  };
}

export function sdk(
  options?: Partial<
    Omit<Extract<PluginConfig, { name: '@hey-api/sdk' }>, 'name'>
  >,
) {
  return {
    name: '@hey-api/sdk' as const,
    ...options,
  };
}

export function zod(
  options?: Partial<Omit<Extract<PluginConfig, { name: 'zod' }>, 'name'>>,
) {
  return {
    name: 'zod' as const,
    ...options,
  };
}

export function valibot(
  options?: Partial<Omit<Extract<PluginConfig, { name: 'valibot' }>, 'name'>>,
) {
  return {
    name: 'valibot' as const,
    ...options,
  };
}

export function tanstackReactQuery(
  options?: Partial<
    Omit<Extract<PluginConfig, { name: '@tanstack/react-query' }>, 'name'>
  >,
) {
  return {
    name: '@tanstack/react-query' as const,
    ...options,
  };
}

export function transformers(
  options?: Partial<
    Omit<Extract<PluginConfig, { name: '@hey-api/transformers' }>, 'name'>
  >,
) {
  return {
    name: '@hey-api/transformers' as const,
    ...options,
  };
}
