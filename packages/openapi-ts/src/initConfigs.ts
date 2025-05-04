import path from 'node:path';

import { loadConfig } from 'c12';

import { getLogs } from './getLogs';
import type { ClientPlugins, UserPlugins } from './plugins';
import { defaultPluginConfigs } from './plugins';
import type {
  AnyPluginName,
  DefaultPluginConfigs,
  PluginContext,
  PluginNames,
} from './plugins/types';
import type { Config, UserConfig } from './types/config';
import { isLegacyClient, setConfig } from './utils/config';

/**
 * Default plugins used to generate artifacts if plugins aren't specified.
 */
export const defaultPlugins = [
  '@hey-api/typescript',
  '@hey-api/sdk',
] as const satisfies ReadonlyArray<UserPlugins['name']>;

const getInput = (userConfig: UserConfig): Config['input'] => {
  let input: Config['input'] = {
    path: '',
  };
  if (typeof userConfig.input === 'string') {
    input.path = userConfig.input;
  } else if (
    userConfig.input &&
    (userConfig.input.path || userConfig.input.organization)
  ) {
    input = {
      ...input,
      path: 'https://get.heyapi.dev',
      ...userConfig.input,
    };
  } else {
    input = {
      ...input,
      path: userConfig.input as Record<string, unknown>,
    };
  }
  return input;
};

const getPluginsConfig = ({
  pluginConfigs,
  userPlugins,
  userPluginsConfig,
}: {
  pluginConfigs: DefaultPluginConfigs<ClientPlugins>;
  userPlugins: ReadonlyArray<AnyPluginName>;
  userPluginsConfig: Config['plugins'];
}): Pick<Config, 'plugins' | 'pluginOrder'> => {
  const circularReferenceTracker = new Set<AnyPluginName>();
  const pluginOrder = new Set<AnyPluginName>();
  const plugins: Config['plugins'] = {};

  const dfs = (name: AnyPluginName) => {
    if (circularReferenceTracker.has(name)) {
      throw new Error(`Circular reference detected at '${name}'`);
    }

    if (!pluginOrder.has(name)) {
      circularReferenceTracker.add(name);

      const pluginConfig = pluginConfigs[name as PluginNames];
      if (!pluginConfig) {
        throw new Error(
          `🚫 unknown plugin dependency "${name}" - do you need to register a custom plugin with this name?`,
        );
      }

      const defaultOptions = defaultPluginConfigs[name as PluginNames];
      const userOptions = userPluginsConfig[name as PluginNames];
      if (userOptions && defaultOptions) {
        const nativePluginOption = Object.keys(userOptions).find((key) =>
          key.startsWith('_'),
        );
        if (nativePluginOption) {
          throw new Error(
            `🚫 cannot register plugin "${name}" - attempting to override a native plugin option "${nativePluginOption}"`,
          );
        }
      }

      const config = {
        _dependencies: [],
        ...defaultOptions,
        ...userOptions,
      };

      if (config._infer) {
        const context: PluginContext = {
          ensureDependency: (dependency) => {
            if (
              typeof dependency === 'string' &&
              !config._dependencies.includes(dependency)
            ) {
              config._dependencies = [...config._dependencies, dependency];
            }
          },
          pluginByTag: (tag, errorMessage) => {
            for (const userPlugin of userPlugins) {
              const defaultConfig =
                defaultPluginConfigs[userPlugin as PluginNames] ||
                pluginConfigs[userPlugin as PluginNames];
              if (
                defaultConfig &&
                defaultConfig._tags?.includes(tag) &&
                userPlugin !== name
              ) {
                return userPlugin;
              }
            }

            throw new Error(
              errorMessage ||
                `🚫 missing plugin - no plugin with tag "${tag}" found`,
            );
          },
        };
        config._infer(config, context);
      }

      for (const dependency of config._dependencies) {
        dfs(dependency);
      }

      circularReferenceTracker.delete(name);
      pluginOrder.add(name);

      // @ts-expect-error
      plugins[name] = config;
    }
  };

  for (const name of userPlugins) {
    dfs(name);
  }

  return {
    pluginOrder: Array.from(pluginOrder) as ReadonlyArray<PluginNames>,
    plugins,
  };
};

const getOutput = (userConfig: UserConfig): Config['output'] => {
  let output: Config['output'] = {
    clean: true,
    format: false,
    indexFile: true,
    lint: false,
    path: '',
    tsConfigPath: '',
  };
  if (typeof userConfig.output === 'string') {
    output.path = userConfig.output;
  } else {
    output = {
      ...output,
      ...userConfig.output,
    };
  }
  return output;
};

const isPluginClient = (plugin: Required<UserConfig>['plugins'][number]) => {
  if (typeof plugin === 'string') {
    return plugin.startsWith('@hey-api/client') || plugin.startsWith('legacy/');
  }

  return (
    plugin.name.startsWith('@hey-api/client') ||
    plugin.name.startsWith('legacy/') ||
    // @ts-expect-error
    (plugin._tags && plugin._tags.includes('client'))
  );
};

const getPlugins = (
  userConfig: UserConfig,
): Pick<Config, 'plugins' | 'pluginOrder'> => {
  const userPluginsConfig: Config['plugins'] = {};

  let definedPlugins: UserConfig['plugins'] = defaultPlugins;
  if (userConfig.plugins) {
    userConfig.plugins = userConfig.plugins.filter(
      (plugin) =>
        (typeof plugin === 'string' && plugin) ||
        (typeof plugin !== 'string' && plugin.name),
    );
    if (
      userConfig.plugins.length === 1 &&
      isPluginClient(userConfig.plugins[0]!)
    ) {
      definedPlugins = [...defaultPlugins, ...userConfig.plugins];
    } else {
      definedPlugins = userConfig.plugins;
    }
  }

  const userPlugins = definedPlugins
    .map((plugin) => {
      if (typeof plugin === 'string') {
        return plugin;
      }

      if (plugin.name) {
        // @ts-expect-error
        userPluginsConfig[plugin.name] = plugin;
      }

      return plugin.name;
    })
    .filter(Boolean);

  return getPluginsConfig({
    pluginConfigs: {
      ...userPluginsConfig,
      ...defaultPluginConfigs,
    },
    userPlugins,
    userPluginsConfig,
  });
};

const getWatch = (
  userConfig: Pick<UserConfig, 'watch'> & Pick<Config, 'input'>,
): Config['watch'] => {
  let watch: Config['watch'] = {
    enabled: false,
    interval: 1_000,
    timeout: 60_000,
  };
  // we cannot watch spec passed as an object
  if (typeof userConfig.input.path !== 'string') {
    return watch;
  }
  if (typeof userConfig.watch === 'boolean') {
    watch.enabled = userConfig.watch;
  } else if (typeof userConfig.watch === 'number') {
    watch.enabled = true;
    watch.interval = userConfig.watch;
  } else if (userConfig.watch) {
    watch = {
      ...watch,
      ...userConfig.watch,
    };
  }
  return watch;
};

/**
 * @internal
 */
export const initConfigs = async (
  userConfig: UserConfig | undefined,
): Promise<Config[]> => {
  let configurationFile: string | undefined = undefined;
  if (userConfig?.configFile) {
    const parts = userConfig.configFile.split('.');
    configurationFile = parts.slice(0, parts.length - 1).join('.');
  }

  const { config: configFromFile } = await loadConfig<UserConfig>({
    configFile: configurationFile,
    name: 'openapi-ts',
  });

  const userConfigs: UserConfig[] = Array.isArray(userConfig)
    ? userConfig
    : Array.isArray(configFromFile)
      ? configFromFile.map((config) => ({
          ...config,
          ...userConfig,
        }))
      : [{ ...(configFromFile ?? {}), ...userConfig }];

  return userConfigs.map((userConfig) => {
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

    const logs = getLogs(userConfig);

    if (logs.level === 'debug') {
      console.warn('userConfig:', userConfig);
    }

    const input = getInput(userConfig);
    const output = getOutput(userConfig);

    if (!input.path) {
      throw new Error(
        '🚫 missing input - which OpenAPI specification should we use to generate your output?',
      );
    }

    if (!output.path) {
      throw new Error(
        '🚫 missing output - where should we generate your output?',
      );
    }

    if (!useOptions) {
      console.warn(
        '❗️ Deprecation warning: useOptions set to false. This setting will be removed in future versions. Please migrate useOptions to true https://heyapi.dev/openapi-ts/migrating.html#v0-27-38',
      );
    }

    output.path = path.resolve(process.cwd(), output.path);

    const config = setConfig({
      ...getPlugins(userConfig),
      base,
      configFile,
      dryRun,
      experimentalParser,
      exportCore: false,
      input,
      logs,
      name,
      output,
      request,
      useOptions,
      watch: getWatch({ ...userConfig, input }),
    });
    config.exportCore = isLegacyClient(config) ? exportCore : false;

    if (logs.level === 'debug') {
      console.warn('config:', config);
    }

    return config;
  });
};
