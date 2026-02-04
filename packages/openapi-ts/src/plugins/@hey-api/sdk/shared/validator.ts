import type { IR } from '@hey-api/shared';

import type { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

interface ValidatorProps {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}

export const createRequestValidator = ({
  operation,
  plugin,
}: ValidatorProps): ReturnType<typeof $.func> | undefined => {
  if (!plugin.config.validator.request) return;

  const validator = plugin.getPluginOrThrow(plugin.config.validator.request);
  if (!validator.api.createRequestValidator) return;

  return validator.api.createRequestValidator({
    operation,
    // @ts-expect-error
    plugin: validator,
  });
};

export const createResponseValidator = ({
  operation,
  plugin,
}: ValidatorProps): ReturnType<typeof $.func> | undefined => {
  if (!plugin.config.validator.response) return;

  const validator = plugin.getPluginOrThrow(plugin.config.validator.response);
  if (!validator.api.createResponseValidator) return;

  return validator.api.createResponseValidator({
    operation,
    // @ts-expect-error
    plugin: validator,
  });
};
