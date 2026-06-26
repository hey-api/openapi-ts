import type { CliConfig } from './types';

interface RawCliArgs {
  client?: string;
  debug?: boolean;
  dryRun?: boolean;
  file?: string;
  input?: string;
  logFile?: boolean;
  logs?: string;
  output?: string;
  plugins?: string;
  silent?: boolean;
  watch?: string;
}

function splitComma(value: string): string | Array<string> {
  const parts = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length === 1 ? parts[0]! : parts;
}

export function cliToConfig(args: RawCliArgs): CliConfig {
  const config: CliConfig = {};

  if (args.input) config.input = splitComma(args.input);
  if (args.output) config.output = splitComma(args.output);
  if (args.file) config.configFile = args.file;
  if (args.dryRun !== undefined) config.dryRun = args.dryRun;

  const plugins: Array<string> = [];
  if (args.plugins) {
    plugins.push(...args.plugins.split(',').map((p) => p.trim()));
  }
  if (args.client) plugins.push(args.client);
  if (plugins.length) config.plugins = plugins;

  if (args.debug || args.silent || args.logs || args.logFile === false) {
    config.logs = {
      ...(args.debug && { level: 'debug' as const }),
      ...(args.logFile === false && { file: false }),
      ...(args.logs && { path: args.logs }),
      ...(args.silent && { level: 'silent' as const }),
    };
  }

  if (args.watch !== undefined) {
    if (args.watch === '') {
      config.watch = true;
    } else {
      const interval = Number.parseInt(args.watch, 10);
      config.watch = Number.isNaN(interval) ? true : interval;
    }
  }

  return config;
}
