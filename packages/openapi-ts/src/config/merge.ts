import type { UserConfig } from '../types/config';

const mergeObjects = (
  objA: Record<string, unknown> | undefined,
  objB: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  const a = objA || {};
  const b = objB || {};
  return {
    ...a,
    ...b,
  };
};

export const mergeConfigs = (
  configA: UserConfig | undefined,
  configB: UserConfig | undefined,
): UserConfig => {
  const a: Partial<UserConfig> = configA || {};
  const b: Partial<UserConfig> = configB || {};
  const merged: UserConfig = {
    ...(a as UserConfig),
    ...(b as UserConfig),
  };
  if (typeof merged.logs === 'object') {
    merged.logs = mergeObjects(
      a.logs as Record<string, unknown>,
      b.logs as Record<string, unknown>,
    );
  }
  return merged;
};
