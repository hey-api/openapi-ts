import path from 'node:path';

import { loadConfig } from 'c12';

import { ConfigError } from '../error';
import type { Config, UserConfig } from '../types/config';
import { isLegacyClient, setConfig } from '../utils/config';
import { getInput } from './input';
import { getLogs } from './logs';
import { mergeConfigs } from './merge';
import { getOutput } from './output';
import { getProjectDependencies } from './packages';
import { getParser } from './parser';
import { getPlugins } from './plugins';

/**
 * Detect if the current session is interactive based on TTY status and environment variables.
 * This is used as a fallback when the user doesn't explicitly set the interactive option.
 * @internal
 */
export const detectInteractiveSession = (): boolean =>
  !!(
    process.stdin.isTTY &&
    process.stdout.isTTY &&
    !process.env.CI &&
    !process.env.NO_INTERACTIVE &&
    !process.env.NO_INTERACTION
  );

/**
 * @internal
 */
export const initConfigs = async (
  userConfig: UserConfig | undefined,
): Promise<{
  dependencies: Record<string, string>;
  results: ReadonlyArray<{
    config: Config;
    errors: ReadonlyArray<Error>;
  }>;
}> => {
  let configurationFile: string | undefined = undefined;
  if (userConfig?.configFile) {
    const parts = userConfig.configFile.split('.');
    configurationFile = parts.slice(0, parts.length - 1).join('.');
  }

  const { config: configFromFile, configFile: loadedConfigFile } =
    await loadConfig<UserConfig>({
      configFile: configurationFile,
      name: 'openapi-ts',
    });

  const dependencies = getProjectDependencies(
    Object.keys(configFromFile).length ? loadedConfigFile : undefined,
  );

  const userConfigs: ReadonlyArray<UserConfig> = Array.isArray(userConfig)
    ? userConfig
    : Array.isArray(configFromFile)
      ? configFromFile.map((config) => mergeConfigs(config, userConfig))
      : [mergeConfigs(configFromFile, userConfig)];

  const results: Array<{
    config: Config;
    errors: Array<Error>;
  }> = [];

  for (const userConfig of userConfigs) {
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

    // Use environment-aware detection only when user doesn't explicitly set interactive
    const interactive =
      userConfig.interactive !== undefined
        ? userConfig.interactive
        : detectInteractiveSession();

    const errors: Array<Error> = [];

    const logs = getLogs(userConfig);

    if (logs.level === 'debug') {
      console.warn('userConfig:', userConfig);
    }

    const input = getInput(userConfig);
    const output = getOutput(userConfig);
    const parser = getParser(userConfig);

    if (!input.path) {
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

    if (logs.level === 'debug') {
      console.warn('config:', config);
    }

    results.push({
      config,
      errors,
    });
  }

  return { dependencies, results };
};
