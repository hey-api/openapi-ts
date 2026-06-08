import type { SymbolFactory } from '@hey-api/shared';

export function AXIOS(factory: SymbolFactory) {
  return {
    AxiosError: factory.register('AxiosError', {
      external: 'axios',
      kind: 'type',
    }),
  };
}
