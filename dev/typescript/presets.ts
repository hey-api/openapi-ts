import type { PluginConfig } from './plugins';
import { sdk, tanstackReactQuery, transformers, typescript, valibot, zod } from './plugins';

export const presets = {
  full: () => [
    /** Full kitchen sink for comprehensive testing */
    typescript(),
    sdk({ paramsStructure: 'flat' }),
    transformers(),
    zod({ metadata: true }),
    tanstackReactQuery({ queryKeys: { tags: true } }),
  ],
  sdk: () => [
    /** SDK with types */
    typescript(),
    sdk({
      operations: {
        containerName: 'OpenCode',
        strategy: 'single',
      },
      paramsStructure: 'flat',
    }),
  ],
  tanstack: () => [
    /** SDK + TanStack Query */
    typescript(),
    sdk(),
    tanstackReactQuery({ queryKeys: { tags: true } }),
  ],
  types: () => [
    /** Just types, nothing else */
    typescript(),
  ],
  validated: () => [
    /** SDK + Zod validation */
    typescript(),
    sdk({ validator: 'zod' }),
    valibot({ metadata: true }),
    zod({ metadata: true }),
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
