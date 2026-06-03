import type { SymbolFactory } from '@hey-api/shared';

export function TYPING(factory: SymbolFactory) {
  return {
    Any: factory.register('Any', { external: 'typing' }),
    Literal: factory.register('Literal', { external: 'typing' }),
    NoReturn: factory.register('NoReturn', { external: 'typing' }),
    Optional: factory.register('Optional', { external: 'typing' }),
    Tuple: factory.register('Tuple', { external: 'typing' }),
    TypeAlias: factory.register('TypeAlias', { external: 'typing' }),
    Union: factory.register('Union', { external: 'typing' }),
  };
}

export type TypingSymbols = ReturnType<typeof TYPING>;
