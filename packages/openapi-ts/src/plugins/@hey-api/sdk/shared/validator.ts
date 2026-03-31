import type { IR, RequestSchemaContext } from '@hey-api/shared';

import type { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

export function createRequestValidator({
  plugin,
  ...args
}: RequestSchemaContext<HeyApiSdkPlugin['Instance']>): ReturnType<typeof $.func> | undefined {
  if (!plugin.config.validator.request) return;

  const validator = plugin.getPluginOrThrow(plugin.config.validator.request);
  if (!validator.api.createRequestValidator) return;

  return validator.api.createRequestValidator({
    ...args,
    // @ts-expect-error
    plugin: validator,
  });
}

export function createResponseValidator({
  operation,
  plugin,
}: {
  /** The operation object. */
  operation: IR.OperationObject;
  /** The plugin instance. */
  plugin: HeyApiSdkPlugin['Instance'];
}): ReturnType<typeof $.func> | undefined {
  if (!plugin.config.validator.response) return;

  const validator = plugin.getPluginOrThrow(plugin.config.validator.response);
  if (!validator.api.createResponseValidator) return;

  return validator.api.createResponseValidator({
    operation,
    // @ts-expect-error
    plugin: validator,
  });
}
