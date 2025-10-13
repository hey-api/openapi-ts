import path from 'node:path';

import colors from 'ansi-colors';

import { ConfigError } from '../error';
import type { Config, UserConfig } from '../types/config';
import type { ArrayOnly } from '../types/utils';
import { isLegacyClient, setConfig } from '../utils/config';
import type { Logger } from '../utils/logger';
import { getInput } from './input';
import { getLogs } from './logs';
import { mergeConfigs } from './merge';
import { getOutput } from './output';
import { getProjectDependencies } from './packages';
import { getParser } from './parser';
import { getPlugins } from './plugins';

type ConfigResult = {
  config: Config;
  errors: ReadonlyArray<Error>;
  jobIndex: number;
};

export type Configs = {
  dependencies: Record<string, string>;
  results: ReadonlyArray<ConfigResult>;
};

/**
 * Detect if the current session is interactive based on TTY status and environment variables.
 * This is used as a fallback when the user doesn't explicitly set the interactive option.
 * @internal
 */
export const detectInteractiveSession = (): boolean =>
  Boolean(
    process.stdin.isTTY &&
      process.stdout.isTTY &&
      !process.env.CI &&
      !process.env.NO_INTERACTIVE &&
      !process.env.NO_INTERACTION,
  );

/**
 * @internal
 */
export const initConfigs = async ({
  logger,
  userConfigs,
}: {
  logger: Logger;
  userConfigs: ReadonlyArray<UserConfig>;
}): Promise<Configs> => {
  const configs: Array<UserConfig> = [];
  let dependencies: Record<string, string> = {};

  const eventLoad = logger.timeEvent('load');
  for (const userConfig of userConfigs) {
    let configurationFile: string | undefined = undefined;
    if (userConfig?.configFile) {
      const parts = userConfig.configFile.split('.');
      configurationFile = parts.slice(0, parts.length - 1).join('.');
    }

    const eventC12 = logger.timeEvent('c12');
    // c12 is ESM-only since v3
    const { loadConfig } = await import('c12');
    const { config: configFromFile, configFile: loadedConfigFile } =
      await loadConfig<UserConfig>({
        configFile: configurationFile,
        name: 'openapi-ts',
      });
    eventC12.timeEnd();

    if (!Object.keys(dependencies).length) {
      // TODO: handle dependencies for multiple configs properly?
      dependencies = getProjectDependencies(
        Object.keys(configFromFile).length ? loadedConfigFile : undefined,
      );
    }

    const mergedConfigs =
      configFromFile instanceof Array
        ? configFromFile.map((config) => mergeConfigs(config, userConfig))
        : [mergeConfigs(configFromFile, userConfig)];

    for (const mergedConfig of mergedConfigs) {
      const input = getInput(mergedConfig);

      if (mergedConfig.output instanceof Array) {
        const countInputs = input.length;
        const countOutputs = mergedConfig.output.length;
        if (countOutputs > 1) {
          if (countInputs !== countOutputs) {
            console.warn(
              `⚙️ ${colors.yellow('Warning:')} You provided ${colors.cyan(String(countInputs))} ${colors.cyan(countInputs === 1 ? 'input' : 'inputs')} and ${colors.yellow(String(countOutputs))} ${colors.yellow('outputs')}. This is probably not what you want as it will produce identical output in multiple locations. You most likely want to provide a single output or the same number of outputs as inputs.`,
            );
            for (const output of mergedConfig.output) {
              configs.push({ ...mergedConfig, input, output });
            }
          } else {
            mergedConfig.output.forEach((output, index) => {
              configs.push({ ...mergedConfig, input: input[index]!, output });
            });
          }
        } else {
          configs.push({
            ...mergedConfig,
            input,
            output: mergedConfig.output[0] ?? '',
          });
        }
      } else {
        configs.push({ ...mergedConfig, input });
      }
    }
  }
  eventLoad.timeEnd();

  const results: Array<ArrayOnly<ConfigResult>> = [];

  const eventBuild = logger.timeEvent('build');
  for (const userConfig of configs) {
    const {
      base,
      configFile = '',
      dryRun = false,
      experimentalParser = true,
      exportCore = true,
      name,
      request,
      useOptions = true,
    } = userConfig;

    const interactive =
      userConfig.interactive !== undefined
        ? userConfig.interactive
        : detectInteractiveSession();

    const logs = getLogs(userConfig);

    const input = getInput(userConfig);
    const output = getOutput(userConfig);
    const parser = getParser(userConfig);

    const errors: Array<Error> = [];

    if (!input.length) {
      errors.push(
        new ConfigError(
          'missing input - which OpenAPI specification should we use to generate your output?',
        ),
      );
    }

    if (!output.path) {
      errors.push(
        new ConfigError(
          'missing output - where should we generate your output?',
        ),
      );
    }

    if (!useOptions) {
      console.warn(
        '❗️ Deprecation warning: useOptions set to false. This setting will be removed in future versions. Please migrate useOptions to true https://heyapi.dev/openapi-ts/migrating.html#v0-27-38',
      );
    }

    output.path = path.resolve(process.cwd(), output.path);

    let plugins: Pick<Config, 'plugins' | 'pluginOrder'>;

    try {
      plugins = getPlugins({ dependencies, userConfig });
    } catch (error) {
      errors.push(error);
      plugins = {
        pluginOrder: [],
        plugins: {},
      };
    }

    const config = setConfig({
      ...plugins,
      base,
      configFile,
      dryRun,
      experimentalParser,
      exportCore: false,
      input,
      interactive,
      logs,
      name,
      output,
      parser,
      request,
      useOptions,
    });
    config.exportCore = isLegacyClient(config) ? exportCore : false;

    const jobIndex = results.length;

    if (logs.level === 'debug') {
      const jobPrefix = colors.gray(`[Job ${jobIndex + 1}] `);
      console.warn(`${jobPrefix}${colors.cyan('config:')}`, config);
    }

    results.push({ config, errors, jobIndex });
  }
  eventBuild.timeEnd();

  return { dependencies, results };
};
