import { sync } from 'cross-spawn';

import type { Formatters, Linters, Output } from './types';

type OutputProcessor = {
  args: (path: string) => ReadonlyArray<string>;
  command: string;
  name: string;
};

/**
 * Map of supported formatters
 */
const formatters: Record<Formatters, OutputProcessor> = {
  biome: {
    args: (path) => ['format', '--write', path],
    command: 'biome',
    name: 'Biome (Format)',
  },
  prettier: {
    args: (path) => [
      '--ignore-unknown',
      path,
      '--write',
      '--ignore-path',
      './.prettierignore',
    ],
    command: 'prettier',
    name: 'Prettier',
  },
};

/**
 * Map of supported linters
 */
const linters: Record<Linters, OutputProcessor> = {
  biome: {
    args: (path) => ['lint', '--apply', path],
    command: 'biome',
    name: 'Biome (Lint)',
  },
  eslint: {
    args: (path) => [path, '--fix'],
    command: 'eslint',
    name: 'ESLint',
  },
  oxlint: {
    args: (path) => ['--fix', path],
    command: 'oxlint',
    name: 'oxlint',
  },
};

export const postprocessOutput = (config: Output): void => {
  if (config.lint) {
    const module = linters[config.lint];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.path));
  }

  if (config.format) {
    const module = formatters[config.format];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.path));
  }
};
