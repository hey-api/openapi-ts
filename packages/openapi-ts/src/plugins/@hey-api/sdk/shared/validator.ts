import type { IR, RequestSchemaContext } from '@hey-api/shared';

import type { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

type ArrowFunc = Extract<ReturnType<typeof $.func>, { '~mode': 'arrow' }>;

export function createRequestValidator({
  plugin,
  ...args
}: RequestSchemaContext<HeyApiSdkPlugin['Instance']>): ArrowFunc | undefined {
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
}): ArrowFunc | undefined {
  if (!plugin.config.validator.response) return;

  const validator = plugin.getPluginOrThrow(plugin.config.validator.response);
  if (!validator.api.createResponseValidator) return;

  return validator.api.createResponseValidator({
    operation,
    // @ts-expect-error
    plugin: validator,
  });
}
