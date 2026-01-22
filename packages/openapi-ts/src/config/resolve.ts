import path from 'node:path';

import { detectInteractiveSession } from '@hey-api/codegen-core';
import colors from 'ansi-colors';

import { getInput } from './input';
import { getLogs } from './logs';
import { getOutput } from './output';
import { getParser } from './parser';
import { getPlugins } from './plugins';
import type { Config } from './types';
import type { ValidationResult } from './validate';

export type ResolvedJob = {
  config: Config;
  errors: Array<Error>;
  index: number;
};

export const resolveConfig = (
  validated: ValidationResult,
  dependencies: Record<string, string>,
): ResolvedJob => {
  const logs = getLogs(validated.job.config);
  const input = getInput(validated.job.config);
  const output = getOutput(validated.job.config);
  const parser = getParser(validated.job.config);

  output.path = path.resolve(process.cwd(), output.path);

  let plugins: Pick<Config, 'plugins' | 'pluginOrder'>;

  try {
    plugins = getPlugins({ dependencies, userConfig: validated.job.config });
  } catch (error) {
    validated.errors.push(error);
    plugins = {
      pluginOrder: [],
      plugins: {},
    };
  }

  const config: Config = {
    configFile: validated.job.config.configFile ?? '',
    dryRun: validated.job.config.dryRun ?? false,
    input,
    interactive: validated.job.config.interactive ?? detectInteractiveSession(),
    logs,
    output,
    parser,
    pluginOrder: plugins.pluginOrder,
    plugins: plugins.plugins,
  };

  if (logs.level === 'debug') {
    const jobPrefix = colors.gray(`[Job ${validated.job.index}] `);
    console.warn(`${jobPrefix}${colors.cyan('config:')}`, config);
  }

  return {
    config,
    errors: validated.errors,
    index: validated.job.index,
  };
};
