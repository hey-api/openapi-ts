import type { PluginConfig } from './plugins';
import { pydantic, sdk } from './plugins';

export const presets = {
  sdk: () => [
    /** SDK */
    sdk({
      operations: {
        containerName: 'OpenCode',
        strategy: 'single',
      },
      paramsStructure: 'flat',
    }),
  ],
  validated: () => [
    /** SDK + Pydantic validation */
    sdk({
      paramsStructure: 'flat',
    }),
    pydantic(),
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
