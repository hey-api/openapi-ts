import type { SymbolFactory } from '@hey-api/shared';

export function FAKER(factory: SymbolFactory, locale?: string) {
  return {
    Faker: factory.register('Faker', {
      external: '@faker-js/faker',
      kind: 'type',
    }),
    faker: factory.register('faker', {
      external: `@faker-js/faker${locale ? `/locale/${locale}` : ''}`,
      importKind: 'named',
    }),
  };
}
