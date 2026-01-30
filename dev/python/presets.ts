import { sdk } from './plugins';

export const presets = {
  sdk: () => [
    /** SDK */
    sdk({
      '~hooks': {
        symbols: {
          // getExportFromFilePath(symbol) {
          //   console.log(symbol.toString());
          //   return undefined;
          // },
        },
      },
    }),
  ],
} as const;

export type PresetKey = keyof typeof presets;

export function getPreset(key: PresetKey = (process.env.PRESET as PresetKey) || 'sdk') {
  const preset = presets[key];
  if (!preset) {
    throw new Error(`Unknown preset: ${key}. Available: ${Object.keys(presets).join(', ')}`);
  }
  return preset();
}
