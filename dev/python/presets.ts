import type { UserConfig } from '@hey-api/openapi-python';
import { plugins } from '@hey-api/openapi-python';

export type PluginConfig = NonNullable<NonNullable<UserConfig['plugins']>[number]>;

export const presets = {
  client: () => [
    /** Just the client */
    plugins.clientHttpx(),
  ],
  none: () => [
    /** No plugins at all */
  ],
  sdk: () => [
    /** SDK */
    plugins.sdk({
      operations: {
        containerName: 'OpenCode',
        strategy: 'single',
      },
      paramsStructure: 'flat',
    }),
  ],
  validated: () => [
    /** SDK + Pydantic validation */
    plugins.sdk({
      paramsStructure: 'flat',
    }),
    plugins.pydantic({
      fieldStyle: 'field',
      modelType: 'BaseModel',
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
