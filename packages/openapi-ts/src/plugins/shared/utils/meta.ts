import type { SymbolMeta } from '@hey-api/codegen-core';

export const pathToSymbolResourceType = (
  path: ReadonlyArray<string | number>,
): SymbolMeta['resourceType'] => {
  if (path.length >= 2) {
    if (path[0] === 'components') {
      if (path[1] === 'schemas') return 'schema';
      if (path[1] === 'parameters') return 'parameter';
      if (path[1] === 'requestBodies') return 'requestBody';
    }
    if (path[0] === 'paths') return 'operation';
    if (path[0] === 'servers') return 'server';
    if (path[0] === 'webhooks') return 'webhook';
  }
  return;
};
