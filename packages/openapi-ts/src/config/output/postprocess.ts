import colors from 'ansi-colors';
import { sync } from 'cross-spawn';

import type { Output } from './types';

/**
 * @deprecated Use `PostProcessorPreset` instead.
 */
export type Formatters = 'biome' | 'prettier';

/**
 * @deprecated Use `PostProcessorPreset` instead.
 */
export type Linters = 'biome' | 'eslint' | 'oxlint';

export type UserPostProcessor = {
  /**
   * Arguments to pass to the command. Use `{{path}}` as a placeholder
   * for the output directory path.
   *
   * @example ['format', '--write', '{{path}}']
   */
  args: ReadonlyArray<string>;
  /**
   * The command to run (e.g., 'biome', 'prettier', 'eslint').
   */
  command: string;
  /**
   * Display name for logging. Defaults to the command name.
   */
  name?: string;
};

export type PostProcessor = {
  /**
   * Arguments to pass to the command.
   */
  args: ReadonlyArray<string>;
  /**
   * The command to run.
   */
  command: string;
  /**
   * Display name for logging.
   */
  name: string;
};

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

export const postprocessOutput = (config: Output, jobPrefix: string): void => {
  for (const processor of config.postProcess) {
    const resolved =
      typeof processor === 'string' ? postProcessors[processor] : processor;

    const name = resolved.name ?? resolved.command;
    const args = resolved.args.map((arg) =>
      arg.replace('{{path}}', config.path),
    );

    console.log(`${jobPrefix}🧹 Running ${colors.cyanBright(name)}`);
    sync(resolved.command, args);
  }
};
