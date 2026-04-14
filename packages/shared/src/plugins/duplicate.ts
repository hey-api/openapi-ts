import { log } from '@hey-api/codegen-core';

type PluginEntry = string | ({ name: string } & Record<string, unknown>);

const stableStringify = (value: unknown): string =>
  JSON.stringify(value, (_, v) => {
    if (typeof v === 'function') {
      return `[function:${(v as () => unknown).toString()}]`;
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
          a.localeCompare(b),
        ),
      );
    }
    return v;
  });

export const warnDuplicatePlugins = (
  plugins: ReadonlyArray<PluginEntry>,
): void => {
  const seen = new Map<string, string>();

  for (const plugin of plugins) {
    if (typeof plugin === 'string') {
      const previous = seen.get(plugin);
      if (previous !== undefined && previous !== '{}') {
        log.warn(
          `Plugin "${plugin}" is configured more than once with conflicting options. Only the last occurrence will take effect.`,
        );
      }
      seen.set(plugin, '{}');
      continue;
    }

    const name = plugin.name;
    if (!name) continue;

    const config = Object.fromEntries(
      Object.entries(plugin as Record<string, unknown>).filter(
        ([key]) => key !== 'name',
      ),
    );
    const serialized = stableStringify(config);
    const previous = seen.get(name);
    if (previous !== undefined && previous !== serialized) {
      log.warn(
        `Plugin "${name}" is configured more than once with conflicting options. Only the last occurrence will take effect.`,
      );
    }
    seen.set(name, serialized);
  }
};
