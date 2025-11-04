import type ts from 'typescript';

import type { IR } from '~/ir/types';

import type { HeyApiSdkPlugin } from '../types';

type Validators = {
  request?: ts.ArrowFunction;
  response?: ts.ArrowFunction;
};

export const createValidators = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): Validators => {
  const validators: Validators = {};
  const values = plugin.config.validator(operation);
  if (values.request) {
    const validator = plugin.getPluginOrThrow(values.request);
    if (validator.api.createRequestValidator) {
      validators.request = validator.api.createRequestValidator({
        operation,
        // @ts-expect-error
        plugin: validator,
      });
    }
  }
  if (values.response) {
    const validator = plugin.getPluginOrThrow(values.response);
    if (validator.api.createResponseValidator) {
      validators.response = validator.api.createResponseValidator({
        operation,
        // @ts-expect-error
        plugin: validator,
      });
    }
  }
  return validators;
};
