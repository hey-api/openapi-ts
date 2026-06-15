import type { CustomImports, PluginInstance } from '@hey-api/shared';

import * as SYMBOLS from '../../symbols';

export function valibotImports(plugin: PluginInstance) {
  const factory = plugin.symbolFactory;
  const imports: Record<string, any> = {
    ...SYMBOLS.VALIBOT(factory),
  };

  for (const [name, def] of Object.entries(
    (plugin.config as { '~imports': CustomImports })['~imports'],
  )) {
    imports[name] = plugin.symbol(name, def);
  }

  return imports;
}

export type ValibotImports = ReturnType<typeof valibotImports>;
