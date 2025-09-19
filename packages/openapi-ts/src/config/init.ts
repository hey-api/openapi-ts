import path from 'node:path';

import { loadConfig } from 'c12';

import { ConfigError } from '../error';
import type {
  Config,
  UserConfig,
  UserConfigMultiOutputs,
} from '../types/config';
import { isLegacyClient, setConfig } from '../utils/config';
import { getInput } from './input';
import { getLogs } from './logs';
import { mergeConfigs } from './merge';
import { getOutput } from './output';
import { getProjectDependencies } from './packages';
import { getParser } from './parser';
import { getPlugins } from './plugins';

/**
 * Expands a UserConfig with multiple outputs into multiple UserConfigs with single outputs
 * @internal
 */
const expandMultiOutputConfigs = (
  userConfigs: ReadonlyArray<UserConfigMultiOutputs>,
): ReadonlyArray<UserConfig> => {
  const expandedConfigs: Array<UserConfig> = [];

  for (const userConfig of userConfigs) {
    if (Array.isArray(userConfig.output)) {
      // Multi-output configuration - expand into multiple single-output configs
      for (const output of userConfig.output) {
        expandedConfigs.push({
          ...userConfig,
          output,
        });
      }
    } else {
      // Single output configuration - keep as is
      expandedConfigs.push(userConfig as UserConfig);
    }
  }

  return expandedConfigs;
};

/**
 * @internal
 */
export const initConfigs = async (
  userConfig:
    | UserConfigMultiOutputs
    | ReadonlyArray<UserConfigMultiOutputs>
    | undefined,
): Promise<{
  dependencies: Record<string, string>;
  results: ReadonlyArray<{
    config: Config;
    errors: ReadonlyArray<Error>;
  }>;
}> => {
  let configurationFile: string | undefined = undefined;
  if (userConfig && !(userConfig instanceof Array)) {
    const cf = userConfig.configFile;
    if (cf) {
      const parts = cf.split('.');
      configurationFile = parts.slice(0, parts.length - 1).join('.');
    }
  }

  const { config: configFromFile, configFile: loadedConfigFile } =
    await loadConfig<UserConfigMultiOutputs>({
      configFile: configurationFile,
      name: 'openapi-ts',
    });

  const dependencies = getProjectDependencies(
    Object.keys(configFromFile).length ? loadedConfigFile : undefined,
  );
  const baseUserConfigs: ReadonlyArray<UserConfigMultiOutputs> = Array.isArray(
    userConfig,
  )
    ? userConfig
    : Array.isArray(configFromFile)
      ? configFromFile.map((config) =>
          mergeConfigs(config, userConfig as UserConfig | undefined),
        )
      : [
          mergeConfigs(
            (configFromFile as UserConfig) ?? ({} as UserConfig),
            userConfig as UserConfig | undefined,
          ),
        ];

  // Expand multi-output configurations into multiple single-output configurations
  const userConfigs = expandMultiOutputConfigs(baseUserConfigs);

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
      interactive = false,
      name,
      request,
      useOptions = true,
    } = userConfig;

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
