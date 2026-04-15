import { log } from '@hey-api/codegen-core';

import type { PluginNames } from './types';

type PluginConfig = {
  name: PluginNames;
};

type PluginDefinition<TConfig extends PluginConfig = PluginConfig> = PluginNames | TConfig;

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_, v) => {
    if (typeof v === 'function') {
      return `[function:${(v as () => unknown).toString()}]`;
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)),
      );
    }
    return v;
  });
}

function normalizePluginEntry<TConfig extends PluginConfig>(
  plugin: PluginDefinition<TConfig>,
): {
  name: PluginNames;
  serialized: string;
} {
  if (typeof plugin === 'string') {
    return {
      name: plugin,
      serialized: '{}',
    };
  }

  const { name, ...config } = plugin;

  return {
    name,
    serialized: stableStringify(config),
  };
}

export function warnOnConflictingDuplicatePlugins<TConfig extends PluginConfig>(
  plugins: ReadonlyArray<PluginDefinition<TConfig>>,
): void {
  const seen = new Map<string, string>();

  for (const plugin of plugins) {
    const { name, serialized } = normalizePluginEntry(plugin);
    if (!name) continue;

    const previous = seen.get(name);
    if (previous !== undefined && previous !== serialized) {
      log.warn(
        `Plugin "${name}" is configured multiple times. Only the last instance will take effect.`,
      );
    }

    seen.set(name, serialized);
  }
}
