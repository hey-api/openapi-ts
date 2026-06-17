import type { SymbolMeta } from '@hey-api/codegen-core';

export function definition(resourceId: string): SymbolMeta {
  return {
    category: 'schema',
    resource: 'definition',
    resourceId,
  };
}

export function operation(resourceId: string): SymbolMeta {
  return {
    category: 'schema',
    resource: 'operation',
    resourceId,
  };
}
