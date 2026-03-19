import type { ToArray } from '@hey-api/types';

import type { UserConfig } from '../config/types';
import type { CliOptions } from './schema';

export const cliToConfig = (cli: CliOptions): Partial<UserConfig> => {
  const config: Partial<UserConfig> = {};

  if (cli.input) config.input = cli.input;
  if (cli.output) config.output = cli.output;
  if (cli.file) config.configFile = cli.file;
  if (cli.dryRun !== undefined) config.dryRun = cli.dryRun;

  const plugins: ToArray<UserConfig['plugins']> = [];
  if (cli.plugins instanceof Array && cli.plugins.length > 0) {
    plugins.push(...cli.plugins);
  }
  // if (cli.client) plugins.push(cli.client);
  if (plugins.length > 0) config.plugins = plugins;

  if (cli.debug || cli.silent || cli.logs || cli.logFile !== undefined) {
    config.logs = {
      ...(cli.logs && { path: cli.logs }),
      ...(cli.debug && { level: 'debug' as const }),
      ...(cli.silent && { level: 'silent' as const }),
      ...(cli.logFile !== undefined && { file: cli.logFile }),
    };
  }

  if (cli.watch !== undefined) {
    if (typeof cli.watch === 'string') {
      config.watch = Number.parseInt(cli.watch, 10);
    } else {
      config.watch = cli.watch;
    }
  }

  return config;
};
