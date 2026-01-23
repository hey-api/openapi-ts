import type { PostProcessor } from '@hey-api/shared';

/**
 * @deprecated Use `PostProcessorPreset` instead.
 */
export type Formatters = 'biome' | 'prettier';

/**
 * @deprecated Use `PostProcessorPreset` instead.
 */
export type Linters = 'biome' | 'eslint' | 'oxlint';

export const postProcessors = {
  'biome:format': {
    args: ['format', '--write', '{{path}}'],
    command: 'biome',
    name: 'Biome (Format)',
  },
  'biome:lint': {
    args: ['lint', '--apply', '{{path}}'],
    command: 'biome',
    name: 'Biome (Lint)',
  },
  eslint: {
    args: ['{{path}}', '--fix'],
    command: 'eslint',
    name: 'ESLint',
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
    args: [
      '--ignore-unknown',
      '{{path}}',
      '--write',
      '--ignore-path',
      './.prettierignore',
    ],
    command: 'prettier',
    name: 'Prettier',
  },
} as const satisfies Record<string, PostProcessor>;

export type PostProcessorPreset = keyof typeof postProcessors;
