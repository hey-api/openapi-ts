import type { IR } from '@hey-api/shared';

import type { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

export function createResponseTransformer({
  operation,
  plugin,
}: {
  /** The operation object. */
  operation: IR.OperationObject;
  /** The plugin instance. */
  plugin: HeyApiSdkPlugin['Instance'];
}): ReturnType<typeof $.func> | undefined {
  const { response } = plugin.config.transformer;
  if (!response) return;

  const transformer = plugin.getPluginOrThrow(response);
  if (
    !transformer.api ||
    !('createResponseTransformer' in transformer.api) ||
    typeof transformer.api.createResponseTransformer !== 'function'
  )
    return;

  return transformer.api.createResponseTransformer({
    operation,
    plugin: transformer,
  });
}
