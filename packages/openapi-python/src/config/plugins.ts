import type {
  AnyPluginName,
  PluginContext,
  PluginNames,
} from '@hey-api/shared';
import { dependencyFactory, valueToObject } from '@hey-api/shared';

import { defaultPluginConfigs } from '../plugins/config';
import type { Config, UserConfig } from './types';

/**
 * Default plugins used to generate artifacts if plugins aren't specified.
 */
export const defaultPlugins = [
  '@hey-api/python-sdk',
] as const satisfies ReadonlyArray<PluginNames>;

function getPluginsConfig({
  dependencies,
  userPlugins,
  userPluginsConfig,
}: {
  dependencies: Record<string, string>;
  userPlugins: ReadonlyArray<AnyPluginName>;
  userPluginsConfig: Config['plugins'];
}): Pick<Config, 'plugins' | 'pluginOrder'> {
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
        package: dependencyFactory(dependencies),
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
        valueToObject,
      };
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
}

function isPluginClient(
  plugin: Required<UserConfig>['plugins'][number],
): boolean {
  if (typeof plugin === 'string') {
    return plugin.startsWith('@hey-api/client');
  }

  return (
    plugin.name.startsWith('@hey-api/client') ||
    // @ts-expect-error
    (plugin.tags && plugin.tags.includes('client'))
  );
}

export function getPlugins({
  dependencies,
  userConfig,
}: {
  dependencies: Record<string, string>;
  userConfig: UserConfig;
}): Pick<Config, 'plugins' | 'pluginOrder'> {
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

  return getPluginsConfig({ dependencies, userPlugins, userPluginsConfig });
}
