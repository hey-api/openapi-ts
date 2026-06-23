import { defineCommand } from 'citty';

import { cliToConfig } from './adapter';
import type { RunCliOptions } from './types';

export function createCommand(options: RunCliOptions) {
  return defineCommand({
    args: {
      client: {
        alias: 'c',
        description: 'HTTP client to generate',
        type: 'string',
      },
      debug: {
        alias: 'd',
        description: 'Enable debug logging',
        type: 'boolean',
      },
      'dry-run': {
        description: 'Skip writing files',
        type: 'boolean',
      },
      file: {
        alias: 'f',
        description: 'Path to config file',
        type: 'string',
      },
      input: {
        alias: 'i',
        description: 'OpenAPI specification(s), comma-separated (path, URL, or string)',
        type: 'string',
        valueHint: 'paths',
      },
      'log-file': {
        default: true,
        negativeDescription: 'Disable log file output',
        type: 'boolean',
      },
      logs: {
        alias: 'l',
        description: 'Logs folder path',
        type: 'string',
      },
      output: {
        alias: 'o',
        description: 'Output folder(s), comma-separated',
        type: 'string',
        valueHint: 'paths',
      },
      plugins: {
        alias: 'p',
        description: 'Plugins to use (comma-separated)',
        type: 'string',
        valueHint: 'names',
      },
      silent: {
        alias: 's',
        description: 'Suppress all output',
        type: 'boolean',
      },
      watch: {
        alias: 'w',
        description: 'Watch for changes (optional interval in ms)',
        type: 'string',
        valueHint: 'ms',
      },
    },
    meta: {
      description: options.meta.description,
      name: options.meta.name,
      version:
        process.env.HEYAPI_CODEGEN_ENV === 'development' ? '[DEVELOPMENT]' : options.meta.version,
    },
    async run({ args }) {
      const config = cliToConfig(args);
      const context = await options.createClient(config);
      const hasActiveWatch = context[0]?.config.input.some((input) => input.watch?.enabled);
      if (!hasActiveWatch) {
        process.exit(0);
      }
    },
  });
}
