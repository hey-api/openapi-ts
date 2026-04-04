import fs from 'node:fs';

import colors from 'ansi-colors';
import { sync } from 'cross-spawn';

import { ConfigError } from '../../error';

type Output = {
  /**
   * The absolute path to the output folder.
   */
  path: string;
  /**
   * Post-processing commands to run on the output folder, executed in order.
   */
  postProcess: ReadonlyArray<string | UserPostProcessor>;
};

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

export function postprocessOutput(
  config: Output,
  postProcessors: Record<string, PostProcessor>,
  jobPrefix: string,
): void {
  if (!config.postProcess.length) {
    return;
  }

  // skip post-processing when the output directory doesn't exist or is empty
  if (!fs.existsSync(config.path) || fs.readdirSync(config.path).length === 0) {
    return;
  }

  for (const processor of config.postProcess) {
    const resolved = typeof processor === 'string' ? postProcessors[processor] : processor;

    // TODO: show warning
    if (!resolved) continue;

    const name = resolved.name ?? resolved.command;
    const args = resolved.args.map((arg) => arg.replace('{{path}}', config.path));

    console.log(`${jobPrefix}🧹 Running ${colors.cyanBright(name)}`);
    const result = sync(resolved.command, args);

    if (result.error) {
      throw new ConfigError(`Post-processor "${name}" failed to run: ${result.error.message}`);
    }

    if (result.status !== null && result.status !== 0) {
      let message = `Post-processor "${name}" exited with code ${result.status}`;
      const stderr = result.stderr?.toString().trim();
      if (stderr) {
        message += `:\n${stderr}`;
      }
      console.warn(`${jobPrefix}${colors.yellow(`⚠️ ${message}`)}`);
    }
  }
}
