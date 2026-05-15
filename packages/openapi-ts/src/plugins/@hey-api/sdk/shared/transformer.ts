import type { SymbolMeta } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

export function createResponseTransformer({
  operation,
  plugin,
}: {
  /** The operation object. */
  operation: IR.OperationObject;
  /** The plugin instance. */
  plugin: HeyApiSdkPlugin['Instance'];
}):
  | Extract<ReturnType<typeof $.func>, { '~mode': 'arrow' }>
  | ReturnType<typeof $.expr>
  | undefined {
  if (!plugin.config.transformer.response) return;

  const transformer = plugin.getPluginOrThrow(plugin.config.transformer.response);

  if (
    transformer?.api?.createResponseTransformer &&
    typeof transformer.api.createResponseTransformer === 'function'
  ) {
    return transformer.api.createResponseTransformer({
      operation,
      plugin: transformer,
    });
  } else {
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
}
