import type { SymbolFactory } from '@hey-api/shared';

export function FUNC_TOOLS(factory: SymbolFactory) {
  return {
    cachedProperty: factory.register('cached_property', {
      external: 'functools',
    }),
  };
}

export type FuncToolsSymbols = ReturnType<typeof FUNC_TOOLS>;
