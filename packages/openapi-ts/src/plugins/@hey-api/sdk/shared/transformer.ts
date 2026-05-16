import type { SymbolMeta } from '@hey-api/codegen-core';

import { $ } from '../../../../ts-dsl';
import type { ResponseHandlers, ValidatorArgs } from './types';

export function createResponseTransformer({
  operation,
  plugin,
}: ValidatorArgs): ResponseHandlers['transformer'] {
  if (!plugin.config.transformer.response) return;

  const transformer = plugin.getPluginOrThrow(plugin.config.transformer.response);
  if (
    transformer.api?.createResponseTransformer &&
    typeof transformer.api.createResponseTransformer === 'function'
  ) {
    return transformer.api.createResponseTransformer({
      operation,
      plugin: transformer,
    });
  }

  const query: SymbolMeta = {
    category: 'transform',
    resource: 'operation',
    resourceId: operation.id,
    role: 'response',
  };
  if (plugin.isSymbolRegistered(query)) {
    const ref = plugin.referenceSymbol(query);
    return $(ref);
  }
}
