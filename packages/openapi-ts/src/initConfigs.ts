import path from 'node:path';

import { loadConfig } from 'c12';

import { getLogs } from './getLogs';
import type { UserPlugins } from './plugins';
import { defaultPluginConfigs } from './plugins';
import type {
  AnyPluginName,
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

const defaultWatch: Config['input']['watch'] = {
  enabled: false,
  interval: 1_000,
  timeout: 60_000,
};

const getInput = (userConfig: UserConfig): Config['input'] => {
  let input: Config['input'] = {
    path: '',
    validate_EXPERIMENTAL: false,
    watch: defaultWatch,
  };
  if (typeof userConfig.input === 'string') {
    input.path = userConfig.input;
  } else if (
    userConfig.input &&
    (userConfig.input.path !== undefined ||
      userConfig.input.organization !== undefined)
  ) {
    // @ts-expect-error
    input = {
      ...input,
      path: 'https://get.heyapi.dev',
      ...userConfig.input,
    };

    // watch only remote files
    if (input.watch !== undefined) {
      input.watch = getWatch(input);
    }
  } else {
    input = {
      ...input,
      path: userConfig.input as Record<string, unknown>,
    };
  }

  if (input.validate_EXPERIMENTAL === true) {
    input.validate_EXPERIMENTAL = 'warn';
  }

  if (
    userConfig.watch !== undefined &&
    input.watch.enabled === defaultWatch.enabled &&
    input.watch.interval === defaultWatch.interval &&
    input.watch.timeout === defaultWatch.timeout
  ) {
    input.watch = getWatch({
      path: input.path,
      // @ts-expect-error
      watch: userConfig.watch,
    });
  }

  return input;
};

const getPluginsConfig = ({
  userPlugins,
  userPluginsConfig,
}: {
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

    if (pluginOrder.has(name)) {
      return;
    }

    circularReferenceTracker.add(name);

    const defaultPlugin = defaultPluginConfigs[name as PluginNames];
    const userPlugin = userPluginsConfig[name as PluginNames];

    if (!defaultPlugin && !userPlugin) {
      throw new Error(
        `unknown plugin dependency "${name}" - do you need to register a custom plugin with this name?`,
      );
    }

    const plugin = {
      _dependencies: [],
      ...defaultPlugin,
      ...userPlugin,
      config: {
        ...defaultPlugin?.config,
        ...userPlugin?.config,
      },
    };

    if (plugin._infer) {
      const context: PluginContext = {
        ensureDependency: (dependency) => {
          if (
            typeof dependency === 'string' &&
            !plugin._dependencies.includes(dependency)
          ) {
            plugin._dependencies = [...plugin._dependencies, dependency];
          }
        },
        pluginByTag: ({ defaultPlugin, errorMessage, tag }) => {
          for (const userPlugin of userPlugins) {
            const defaultConfig =
              defaultPluginConfigs[userPlugin as PluginNames] ||
              userPluginsConfig[userPlugin as PluginNames];
            if (
              defaultConfig &&
              defaultConfig._tags?.includes(tag) &&
              userPlugin !== name
            ) {
              return userPlugin;
            }
          }

          if (defaultPlugin) {
            const defaultConfig =
              defaultPluginConfigs[defaultPlugin as PluginNames] ||
              userPluginsConfig[defaultPlugin as PluginNames];
            if (
              defaultConfig &&
              defaultConfig._tags?.includes(tag) &&
              defaultPlugin !== name
            ) {
              return defaultPlugin;
            }
          }

          throw new Error(
            errorMessage ||
              `missing plugin - no plugin with tag "${tag}" found`,
          );
        },
      };
      // @ts-expect-error
      plugin._infer(plugin, context);
    }

    for (const dependency of plugin._dependencies) {
      dfs(dependency);
    }

    circularReferenceTracker.delete(name);
    pluginOrder.add(name);

    // @ts-expect-error
    plugins[name] = plugin;
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

      const pluginName = plugin.name;

      if (pluginName) {
        // @ts-expect-error
        if (plugin._handler) {
          // @ts-expect-error
          userPluginsConfig[pluginName] = plugin;
        } else {
          // @ts-expect-error
          userPluginsConfig[pluginName] = {
            config: { ...plugin },
          };
          // @ts-expect-error
          delete userPluginsConfig[pluginName]!.config.name;
        }
      }

      return pluginName;
    })
    .filter(Boolean);

  return getPluginsConfig({ userPlugins, userPluginsConfig });
};

const getWatch = (
  input: Pick<Config['input'], 'path' | 'watch'>,
): Config['input']['watch'] => {
  let watch = { ...defaultWatch };
  // we cannot watch spec passed as an object
  if (typeof input.path !== 'string') {
    return watch;
  }
  if (typeof input.watch === 'boolean') {
    watch.enabled = input.watch;
  } else if (typeof input.watch === 'number') {
    watch.enabled = true;
    watch.interval = input.watch;
  } else if (input.watch) {
    watch = {
      ...watch,
      ...input.watch,
    };
  }
  return watch;
};

const mergeObjects = (
  objA: Record<string, unknown> | undefined,
  objB: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  const a = objA || {};
  const b = objB || {};
  return {
    ...a,
    ...b,
  };
};

const mergeConfigs = (
  configA: UserConfig | undefined,
  configB: UserConfig | undefined,
): UserConfig => {
  const a: Partial<UserConfig> = configA || {};
  const b: Partial<UserConfig> = configB || {};
  const merged: UserConfig = {
    ...(a as UserConfig),
    ...(b as UserConfig),
  };
  if (typeof merged.logs === 'object') {
    merged.logs = mergeObjects(
      a.logs as Record<string, unknown>,
      b.logs as Record<string, unknown>,
    );
  }
  return merged;
};

/**
 * @internal
 */
export const initConfigs = async (
  userConfig: UserConfig | undefined,
): Promise<
  ReadonlyArray<{
    config: Config;
    errors: ReadonlyArray<Error>;
  }>
> => {
  let configurationFile: string | undefined = undefined;
  if (userConfig?.configFile) {
    const parts = userConfig.configFile.split('.');
    configurationFile = parts.slice(0, parts.length - 1).join('.');
  }

  const { config: configFromFile } = await loadConfig<UserConfig>({
    configFile: configurationFile,
    name: 'openapi-ts',
  });

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

    const errors: Array<Error> = [];

    const logs = getLogs(userConfig);

    if (logs.level === 'debug') {
      console.warn('userConfig:', userConfig);
    }

    const input = getInput(userConfig);
    const output = getOutput(userConfig);

    if (!input.path) {
      errors.push(
        new Error(
          'missing input - which OpenAPI specification should we use to generate your output?',
        ),
      );
    }

    if (!output.path) {
      errors.push(
        new Error('missing output - where should we generate your output?'),
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
      plugins = getPlugins(userConfig);
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
      logs,
      name,
      output,
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

  return results;
};
