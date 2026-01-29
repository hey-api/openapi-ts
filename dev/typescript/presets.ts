import {
  sdk,
  tanstackReactQuery,
  transformers,
  typescript,
  zod,
} from './plugins';

export const presets = {
  full: () => [
    /** Full kitchen sink for comprehensive testing */
    typescript(),
    sdk({ paramsStructure: 'flat' }),
    transformers(),
    zod({ metadata: true }),
    tanstackReactQuery({ queryKeys: { tags: true } }),
  ],
  minimal: () => [
    /** Just types, nothing else */
    typescript(),
  ],
  sdk: () => [
    /** SDK with types */
    typescript(),
    sdk(),
  ],
  tanstack: () => [
    /** SDK + TanStack Query */
    typescript(),
    sdk(),
    tanstackReactQuery({ queryKeys: { tags: true } }),
  ],
  validated: () => [
    /** SDK + Zod validation */
    typescript(),
    sdk({ validator: 'zod' }),
    zod({ metadata: true }),
  ],
} as const;

export type PresetKey = keyof typeof presets;

export function getPreset(
  key: PresetKey = (process.env.PRESET as PresetKey) || 'sdk',
) {
  const preset = presets[key];
  if (!preset) {
    throw new Error(
      `Unknown preset: ${key}. Available: ${Object.keys(presets).join(', ')}`,
    );
  }
  return preset();
}
