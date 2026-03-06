import type { UserConfig } from '@hey-api/openapi-python';

export type PluginConfig = NonNullable<NonNullable<UserConfig['plugins']>[number]>;

export function sdk(
  options?: Omit<Extract<PluginConfig, { name: '@hey-api/python-sdk' }>, 'name'>,
): Extract<PluginConfig, { name: '@hey-api/python-sdk' }> {
  return {
    name: '@hey-api/python-sdk',
    ...options,
  };
}

export function pydantic(
  options?: Omit<Extract<PluginConfig, { name: 'pydantic' }>, 'name'>,
): Extract<PluginConfig, { name: 'pydantic' }> {
  return {
    name: 'pydantic',
    ...options,
  };
}
