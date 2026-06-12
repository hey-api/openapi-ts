import { log } from '@hey-api/codegen-core';
import type { AnyObject } from '@hey-api/types';

import type { Preset } from '../config/presets';
import { dependencyFactory } from '../config/utils/dependencies';
import { defineConfig } from '../normalize/config';
import { collectDeps } from '../normalize/value';
import { deepMerge } from '../utils/object';
import type { AnyPluginName, Plugin, PluginContext } from './types';

export function definePluginConfig<T extends Plugin.Types>(pluginConfig: Plugin.Config<T>) {
  return (userConfig?: Omit<T['config'], 'name'>) => ({
    ...pluginConfig,
    config: { ...pluginConfig.config, ...(userConfig ?? {}) } as Plugin.Config<T>['config'],
    /**
     * Cast name to `any` so it doesn't throw type error in `plugins` array.
     * We could allow any `string` as plugin `name` in the object syntax, but
     * that TypeScript trick would cause all string methods to appear as
     * suggested auto completions, which is undesirable.
     */
    name: pluginConfig.name as any,
  });
}

export interface PluginResolutionInput {
  /** Registry of built-in plugin definitions keyed by name. */
  defaultPluginConfigs: Partial<Record<string, any>>;
  /** Plugins to include when the user doesn't specify any. */
  defaultPlugins: ReadonlyArray<string>;
  /** Resolved project dependencies. */
  dependencies: Record<string, string>;
  /** Raw user configuration (only the `plugins` field is read). */
  userConfig: {
    plugins?: ReadonlyArray<string | { name: string }>;
    presets?: ReadonlyArray<Preset>;
  };
}

export interface PluginResolutionResult<TPluginNames extends string = string> {
  pluginOrder: ReadonlyArray<TPluginNames>;
  plugins: Record<string, any>;
}

function isPluginClient(plugin: string | (AnyObject & { name: string })): boolean {
  if (typeof plugin === 'string') {
    return plugin.startsWith('@hey-api/client');
  }

  return (
    plugin.name.startsWith('@hey-api/client') ||
    (Array.isArray(plugin.tags) && plugin.tags.includes('client'))
  );
}

function resolvePluginsConfig({
  defaultPluginConfigs,
  dependencies,
  userPlugins,
  userPluginsConfig,
}: {
  defaultPluginConfigs: PluginResolutionInput['defaultPluginConfigs'];
  dependencies: Record<string, string>;
  userPlugins: ReadonlyArray<AnyPluginName>;
  userPluginsConfig: Record<string, Plugin.Config<Plugin.Types<any>>>;
}): {
  pluginOrder: ReadonlyArray<AnyPluginName>;
  plugins: Record<string, Plugin.Config<Plugin.Types<any>>>;
} {
  const circularReferenceTracker = new Set<AnyPluginName>();
  const pluginOrder = new Set<AnyPluginName>();
  const plugins: Record<string, Plugin.Config<Plugin.Types<any>>> = {};
  const warnedMessages = new Set<string>();

  function dfs(name: AnyPluginName): void {
    if (circularReferenceTracker.has(name)) {
      throw new Error(`Circular reference detected at '${name}'`);
    }

    if (pluginOrder.has(name)) return;
    circularReferenceTracker.add(name);

    const defaultPlugin = defaultPluginConfigs[name];
    const userPlugin = userPluginsConfig[name];

    if (!defaultPlugin && !userPlugin) {
      throw new Error(
        `unknown plugin "${name}" - do you need to register a custom plugin with this name?`,
      );
    }

    const configTable: AnyObject = defaultPlugin?.config ?? userPlugin?.config ?? {};
    const userConfig = defaultPlugin && userPlugin?.config ? (userPlugin.config as AnyObject) : {};

    const pluginContext: PluginContext = {
      package: dependencyFactory(dependencies),
      resolveTag(tag, options = {}) {
        const { defaultPlugin, fallback = false, warn: warnMessage } = options;

        for (const userPlugin of userPlugins) {
          const defaultConfig = defaultPluginConfigs[userPlugin] || userPluginsConfig[userPlugin];
          if (defaultConfig?.tags?.includes(tag) && userPlugin !== name) {
            return userPlugin as NonNullable<(typeof options)['defaultPlugin']>;
          }
        }

        if (defaultPlugin) {
          const defaultConfig =
            defaultPluginConfigs[defaultPlugin] || userPluginsConfig[defaultPlugin];
          if (defaultConfig?.tags?.includes(tag) && defaultPlugin !== name) {
            return defaultPlugin;
          }
        }

        if (warnMessage && !warnedMessages.has(warnMessage)) {
          warnedMessages.add(warnMessage);
          log.warn(warnMessage);
        }

        return fallback;
      },
    };

    const finalConfig = defineConfig(configTable)(userConfig, pluginContext);
    const finalDependencies = new Set([
      ...(defaultPlugin?.dependencies || []),
      ...(userPlugin?.dependencies || []),
    ]);

    const plugin: Plugin.Config<Plugin.Types<any>>['config'] = {
      ...defaultPlugin,
      ...userPlugin,
      config: finalConfig,
      dependencies: finalDependencies,
    };

    collectDeps(configTable, finalConfig, finalDependencies);

    for (const dependency of plugin.dependencies) {
      dfs(dependency);
    }

    circularReferenceTracker.delete(name);
    pluginOrder.add(name);

    // @ts-expect-error
    plugins[name] = plugin;
  }

  for (const name of userPlugins) {
    dfs(name);
  }

  return {
    pluginOrder: Array.from(pluginOrder),
    plugins,
  };
}

export function resolvePlugins<TPluginNames extends string = string>({
  defaultPluginConfigs,
  defaultPlugins,
  dependencies,
  userConfig,
}: PluginResolutionInput): PluginResolutionResult<TPluginNames> {
  const userPluginsConfig: Record<string, Plugin.Config<Plugin.Types<any>>> = {};

  const rawPresetPlugins = (userConfig.presets ?? []).flatMap((preset) => preset.plugins ?? []);
  const rawUserPlugins = userConfig.plugins ?? [];
  const rawPlugins = [
    ...rawPresetPlugins,
    ...(rawUserPlugins.length ? rawUserPlugins : defaultPlugins),
  ].filter(
    (plugin) =>
      (typeof plugin === 'string' && plugin) || (typeof plugin !== 'string' && plugin.name),
  );

  const mergedPlugins: Array<string | AnyObject> = [];
  const seenNames = new Map<string, { index: number; value: string | AnyObject }>();

  for (const plugin of rawPlugins) {
    if (typeof plugin === 'string') {
      if (!seenNames.has(plugin)) {
        seenNames.set(plugin, { index: mergedPlugins.length, value: plugin });
        mergedPlugins.push(plugin);
      }
      continue;
    }

    if (!plugin?.name) continue;

    const name = plugin.name;
    if (!seenNames.has(name)) {
      seenNames.set(name, { index: mergedPlugins.length, value: plugin });
      mergedPlugins.push(plugin);
      continue;
    }

    const prev = seenNames.get(name)!;
    if (typeof prev.value === 'string') {
      seenNames.set(name, { index: prev.index, value: { ...plugin } });
      mergedPlugins[prev.index] = { ...plugin };
      continue;
    }

    const mergedObj = deepMerge(prev.value, plugin);
    seenNames.set(name, { index: prev.index, value: mergedObj });
    mergedPlugins[prev.index] = mergedObj;
  }

  if (
    mergedPlugins.length > 0 &&
    mergedPlugins.every((plugin) =>
      isPluginClient(plugin as string | (AnyObject & { name: string })),
    )
  ) {
    for (const name of [...defaultPlugins].reverse()) {
      if (!seenNames.has(name)) {
        mergedPlugins.unshift(name);
      }
    }
  }

  const userPlugins = mergedPlugins
    .map((plugin) => {
      if (typeof plugin === 'string') {
        return plugin;
      }

      const pluginName = plugin.name as string;

      if (pluginName) {
        if (plugin.handler) {
          // @ts-expect-error
          userPluginsConfig[pluginName] = plugin;
        } else {
          // @ts-expect-error
          userPluginsConfig[pluginName] = {
            config: { ...plugin },
          };
          delete userPluginsConfig[pluginName]!.config.name;
        }
      }

      return pluginName;
    })
    .filter(Boolean);

  return resolvePluginsConfig({
    defaultPluginConfigs,
    dependencies,
    userPlugins,
    userPluginsConfig,
  }) as PluginResolutionResult<TPluginNames>;
}
