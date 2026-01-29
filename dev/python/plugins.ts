import type { UserConfig } from '@hey-api/openapi-python';

type PluginConfig = NonNullable<NonNullable<UserConfig['plugins']>[number]>;

export function sdk(
  options?: Partial<Omit<Extract<PluginConfig, { name: '@hey-api/python-sdk' }>, 'name'>>,
) {
  return {
    name: '@hey-api/python-sdk' as const,
    ...options,
  };
}
