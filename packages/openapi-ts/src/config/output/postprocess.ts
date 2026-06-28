import type { PostProcessor } from '@hey-api/shared';

/**
 * @deprecated Use `PostProcessorPreset` instead.
 */
export type Formatters = 'biome' | 'prettier';

/**
 * @deprecated Use `PostProcessorPreset` instead.
 */
export type Linters = 'biome' | 'oxlint';

export const postProcessors = {
  'biome:check': {
    args: ['check', '--write', '{{path}}'],
    command: 'biome',
    name: 'Biome (Check)',
  },
  'biome:format': {
    args: ['format', '--write', '{{path}}'],
    command: 'biome',
    name: 'Biome (Format)',
  },
  'biome:lint': {
    args: ['lint', '--write', '{{path}}'],
    command: 'biome',
    name: 'Biome (Lint)',
  },
  oxfmt: {
    args: ['{{path}}'],
    command: 'oxfmt',
    name: 'Oxfmt',
  },
  oxlint: {
    args: ['--fix', '{{path}}'],
    command: 'oxlint',
    name: 'Oxlint',
  },
  prettier: {
    args: ['--ignore-unknown', '{{path}}', '--write', '--ignore-path', './.prettierignore'],
    command: 'prettier',
    name: 'Prettier',
  },
} as const satisfies Record<string, PostProcessor>;

export type PostProcessorPreset = keyof typeof postProcessors;
