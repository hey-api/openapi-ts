import type { SymbolFactory } from '@hey-api/shared';

export function DATETIME(factory: SymbolFactory) {
  return {
    date: factory.register('date', { external: 'datetime' }),
    datetime: factory.register('datetime', { external: 'datetime' }),
    time: factory.register('time', { external: 'datetime' }),
    timedelta: factory.register('timedelta', { external: 'datetime' }),
  };
}

export type DateTimeSymbols = ReturnType<typeof DATETIME>;
