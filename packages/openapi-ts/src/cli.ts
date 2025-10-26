import type { OptionValues } from 'commander';
import { Command } from 'commander';

import { createClient } from '~/index';

import pkg from '../package.json' assert { type: 'json' };

const stringToBoolean = (
  value: string | undefined,
): boolean | string | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const processParams = (
  obj: OptionValues,
  booleanKeys: ReadonlyArray<string>,
): OptionValues => {
  for (const key of booleanKeys) {
    const value = obj[key];
    if (typeof value === 'string') {
      const parsedValue = stringToBoolean(value);
      delete obj[key];
      obj[key] = parsedValue;
    }
  }
  return obj;
};

export const runCli = async (): Promise<void> => {
  const params = new Command()
    .name(Object.keys(pkg.bin)[0]!)
    .usage('[options]')
    .version(pkg.version)
    .option(
      '-c, --client <value>',
      'HTTP client to generate [@hey-api/client-axios, @hey-api/client-fetch, @hey-api/client-next, @hey-api/client-nuxt, legacy/angular, legacy/axios, legacy/fetch, legacy/node, legacy/xhr]',
    )
    .option('-d, --debug', 'Set log level to debug')
    .option('--dry-run [value]', 'Skip writing files to disk?')
    .option(
      '-e, --experimental-parser [value]',
      'Opt-in to the experimental parser?',
    )
    .option('-f, --file [value]', 'Path to the config file')
    .option(
      '-i, --input <value>',
      'OpenAPI specification (path, url, or string content)',
    )
    .option('-l, --logs [value]', 'Logs folder')
    .option('-o, --output <value>', 'Output folder')
    .option('-p, --plugins [value...]', "List of plugins you'd like to use")
    .option(
      '--base [value]',
      'DEPRECATED. Manually set base in OpenAPI config instead of inferring from server value',
    )
    .option('-s, --silent', 'Set log level to silent')
    .option(
      '--no-log-file',
      'Disable writing a log file. Works like --silent but without suppressing console output',
    )
    .option(
      '-w, --watch [value]',
      'Regenerate the client when the input file changes?',
    )
    .option('--exportCore [value]', 'DEPRECATED. Write core files to disk')
    .option('--name <value>', 'DEPRECATED. Custom client class name')
    .option('--request <value>', 'DEPRECATED. Path to custom request file')
    .option(
      '--useOptions [value]',
      'DEPRECATED. Use options instead of arguments?',
    )
    .parse(process.argv)
    .opts();

  let userConfig: Record<string, unknown>;

  try {
    userConfig = processParams(params, [
      'dryRun',
      'experimentalParser',
      'exportCore',
      'logFile',
      'useOptions',
    ]);

    if (userConfig.file) {
      userConfig.configFile = userConfig.file;
      delete userConfig.file;
    }

    if (params.plugins === true) {
      userConfig.plugins = [];
    } else if (params.plugins) {
      userConfig.plugins = params.plugins;
    } else if (userConfig.client) {
      userConfig.plugins = ['@hey-api/typescript', '@hey-api/sdk'];
    }

    if (userConfig.client) {
      (userConfig.plugins as Array<string>).push(userConfig.client as string);
      delete userConfig.client;
    }

    userConfig.logs = userConfig.logs
      ? {
          path: userConfig.logs,
        }
      : {};

    if (userConfig.debug || stringToBoolean(process.env.DEBUG)) {
      (userConfig.logs as Record<string, unknown>).level = 'debug';
      delete userConfig.debug;
    } else if (userConfig.silent) {
      (userConfig.logs as Record<string, unknown>).level = 'silent';
      delete userConfig.silent;
    }

    (userConfig.logs as Record<string, unknown>).file = userConfig.logFile;
    delete userConfig.logFile;

    if (typeof params.watch === 'string') {
      userConfig.watch = Number.parseInt(params.watch, 10);
    }

    if (!Object.keys(userConfig.logs as Record<string, unknown>).length) {
      delete userConfig.logs;
    }

    const context = await createClient(
      userConfig as unknown as Required<Parameters<typeof createClient>>[0],
    );
    if (
      !context[0]?.config.input.some(
        (input) => input.watch && input.watch.enabled,
      )
    ) {
      process.exit(0);
    }
  } catch {
    process.exit(1);
  }
};
