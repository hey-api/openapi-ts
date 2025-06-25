import { defaultPluginConfigs } from '../plugins/config';
import type {
  AnyPluginName,
  PluginContext,
  PluginNames,
} from '../plugins/types';
import type { Config, UserConfig } from '../types/config';

/**
 * Default plugins used to generate artifacts if plugins aren't specified.
 */
export const defaultPlugins = [
  '@hey-api/typescript',
  '@hey-api/sdk',
] as const satisfies ReadonlyArray<PluginNames>;

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
      ...defaultPlugin,
      ...userPlugin,
      config: {
        ...defaultPlugin?.config,
        ...userPlugin?.config,
      },
      dependencies: new Set([
        ...(defaultPlugin?.dependencies || []),
        ...(userPlugin?.dependencies || []),
      ]),
    };

    if (plugin.resolveConfig) {
      const context: PluginContext = {
        pluginByTag: (tag, props = {}) => {
          const { defaultPlugin, errorMessage } = props;

          for (const userPlugin of userPlugins) {
            const defaultConfig =
              defaultPluginConfigs[userPlugin as PluginNames] ||
              userPluginsConfig[userPlugin as PluginNames];
            if (
              defaultConfig &&
              defaultConfig.tags?.includes(tag) &&
              userPlugin !== name
            ) {
              return userPlugin as any;
            }
          }

          if (defaultPlugin) {
            const defaultConfig =
              defaultPluginConfigs[defaultPlugin as PluginNames] ||
              userPluginsConfig[defaultPlugin as PluginNames];
            if (
              defaultConfig &&
              defaultConfig.tags?.includes(tag) &&
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
        valueToObject: ({ defaultValue, mappers, value }) => {
          let result = { ...defaultValue };
          switch (typeof value) {
            case 'boolean':
              if ('boolean' in mappers) {
                const mapper = mappers.boolean as (
                  value: boolean,
                ) => Record<string, any>;
                result = { ...result, ...mapper(value) };
              }
              break;
            case 'number':
              if ('number' in mappers) {
                const mapper = mappers.number as (
                  value: number,
                ) => Record<string, any>;
                result = { ...result, ...mapper(value) };
              }
              break;
            case 'string':
              if ('string' in mappers) {
                const mapper = mappers.string as (
                  value: string,
                ) => Record<string, any>;
                result = { ...result, ...mapper(value) };
              }
              break;
            case 'object':
              if (value !== null) {
                result = { ...result, ...value };
              }
              break;
          }
          return result;
        },
      };
      // @ts-expect-error
      plugin.resolveConfig(plugin, context);
    }

    for (const dependency of plugin.dependencies) {
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

const isPluginClient = (plugin: Required<UserConfig>['plugins'][number]) => {
  if (typeof plugin === 'string') {
    return plugin.startsWith('@hey-api/client') || plugin.startsWith('legacy/');
  }

  return (
    plugin.name.startsWith('@hey-api/client') ||
    plugin.name.startsWith('legacy/') ||
    // @ts-expect-error
    (plugin.tags && plugin.tags.includes('client'))
  );
};

export const getPlugins = (
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
        if (plugin.handler) {
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
