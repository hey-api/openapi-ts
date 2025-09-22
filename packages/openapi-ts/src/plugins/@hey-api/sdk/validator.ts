import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import type { HeyApiSdkPlugin } from './types';

interface ValidatorProps {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}

export const createRequestValidator = ({
  operation,
  plugin,
}: ValidatorProps): ts.ArrowFunction | undefined => {
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
}: ValidatorProps): ts.ArrowFunction | undefined => {
  if (!plugin.config.validator.response) return;

  const validator = plugin.getPluginOrThrow(plugin.config.validator.response);
  if (!validator.api.createResponseValidator) return;

  return validator.api.createResponseValidator({
    operation,
    // @ts-expect-error
    plugin: validator,
  });
};
