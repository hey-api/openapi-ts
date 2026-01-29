import { Command, CommanderError } from 'commander';

import pkg from '../../package.json';
import { createClient } from '../index';
import { cliToConfig } from './adapter';

const binName = Object.keys(pkg.bin)[0]!;

const program = new Command()
  .name(binName)
  .description('Generate TypeScript code from OpenAPI specifications')
  .version(pkg.version);

program
  .option('-i, --input <path...>', 'OpenAPI specification (path, URL, or string)')
  .option('-o, --output <path...>', 'Output folder(s)')
  .option('-c, --client <name>', 'HTTP client to generate')
  .option('-p, --plugins [names...]', 'Plugins to use')
  .option('-f, --file <path>', 'Path to config file')
  .option('-d, --debug', 'Enable debug logging')
  .option('-s, --silent', 'Suppress all output')
  .option('-l, --logs <path>', 'Logs folder path')
  .option('--no-log-file', 'Disable log file output')
  .option('--dry-run', 'Skip writing files')
  .option('-w, --watch [interval]', 'Watch for changes')
  .action(async (options) => {
    const config = cliToConfig(options);

    const context = await createClient(config as Parameters<typeof createClient>[0]);

    const hasActiveWatch = context[0]?.config.input.some((input) => input.watch?.enabled);

    if (!hasActiveWatch) {
      process.exit(0);
    }
  });

export async function runCli(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof CommanderError && 'code' in error) {
      if (error.code === 'commander.optionMissingArgument') {
        console.error(`\nMissing required argument. Run '${binName} --help' for usage.\n`);
      } else if (error.code === 'commander.unknownOption') {
        console.error(`\nUnknown option. Run '${binName} --help' for available options.\n`);
      }

      process.exit(error.exitCode);
    }

    console.error('Unexpected error:', error);
    process.exit(1);
  }
}
