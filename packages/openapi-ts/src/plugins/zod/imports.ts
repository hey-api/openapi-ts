import type { CustomImports, PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function zodImports(plugin: PluginInstance) {
  const imports: Record<string, any> = {
    ...SYMBOLS.ZOD(plugin),
  };

  for (const [name, def] of Object.entries(
    (plugin.config as { '~imports': CustomImports })['~imports'],
  )) {
    imports[name] = plugin.symbol(name, def);
  }

  return imports;
}

export type ZodImports = ReturnType<typeof zodImports>;
