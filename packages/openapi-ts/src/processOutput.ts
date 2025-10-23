import { sync } from 'cross-spawn';

import type { Config } from '~/types/config';
import type { Formatters, Linters } from '~/types/output';

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

export const processOutput = ({ config }: { config: Config }) => {
  if (config.output.format) {
    const module = formatters[config.output.format];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.output.path));
  }

  if (config.output.lint) {
    const module = linters[config.output.lint];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.output.path));
  }
};
