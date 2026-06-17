import type { UserConfig } from '@hey-api/openapi-ts';
import { plugins } from '@hey-api/openapi-ts';

export type PluginConfig = NonNullable<NonNullable<UserConfig['plugins']>[number]>;

export const presets = {
  angular: () => [
    plugins.angularCommon({
      httpRequests: 'flat',
    }),
  ],
  client: () => [
    /** Just the client */
    plugins.clientAxios(),
  ],
  full: () => [
    /** Full kitchen sink for comprehensive testing */
    plugins.typescript(),
    plugins.sdk({
      paramsStructure: 'flat',
    }),
    plugins.transformers({
      dates: true,
    }),
    plugins.zod({
      metadata: true,
    }),
    plugins.tanstackReactQuery({
      queryKeys: {
        tags: true,
      },
    }),
  ],
  none: () => [
    /** No plugins at all */
  ],
  rpc: () => [
    /** RPC-style SDK with Zod validation */
    plugins.orpc(),
    plugins.zod(),
  ],
  sdk: () => [
    /** SDK with types */
    plugins.typescript(),
    plugins.sdk({
      operations: {
        containerName: 'OpenCode',
        strategy: 'single',
      },
      paramsStructure: 'flat',
    }),
  ],
  tanstack: () => [
    /** SDK + TanStack Query */
    plugins.typescript(),
    plugins.sdk(),
    plugins.tanstackReactQuery({
      queryKeys: {
        tags: true,
      },
    }),
  ],
  transformed: () => [
    /** SDK + transforms */
    plugins.typescript(),
    plugins.sdk({
      transformer: 'valibot',
    }),
    plugins.valibot(),
    plugins.zod(),
  ],
  types: () => [
    /** Just types, nothing else */
    plugins.typescript(),
  ],
  validated: () => [
    /** SDK + validation */
    plugins.typescript(),
    plugins.sdk({
      validator: 'zod',
    }),
    plugins.valibot({
      metadata: true,
    }),
    plugins.zod({
      metadata: true,
    }),
  ],
} as const satisfies Record<string, () => ReadonlyArray<PluginConfig>>;

export type PresetKey = keyof typeof presets;

export function getPreset(
  key: PresetKey = (process.env.PRESET as PresetKey) || 'sdk',
): ReadonlyArray<PluginConfig> {
  const preset = presets[key];
  if (!preset) {
    throw new Error(`Unknown preset: ${key}. Available: ${Object.keys(presets).join(', ')}`);
  }
  return preset();
}
