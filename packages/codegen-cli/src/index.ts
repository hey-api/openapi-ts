import { runMain } from 'citty';

import { createCommand } from './command';
import type { RunCliOptions } from './types';

export async function runCli(options: RunCliOptions): Promise<void> {
  const command = createCommand(options);
  await runMain(command);
}

export type { CliConfig, CliContext, RunCliOptions } from './types';
