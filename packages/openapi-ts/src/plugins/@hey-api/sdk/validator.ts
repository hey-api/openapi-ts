import type { IR } from '../../../ir/types';
import type { HeyApiSdkPlugin } from './types';

interface ValidatorProps {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}

export const createRequestValidator = ({
  operation,
  plugin,
}: ValidatorProps) => {
  if (!plugin.config.validator.request) return;

  const validator = plugin.getPlugin(plugin.config.validator.request);
  if (!validator?.api.createRequestValidator) return;

  return validator.api.createRequestValidator({
    file: plugin.gen.ensureFile(plugin.output),
    operation,
    // @ts-expect-error
    plugin: validator,
  });
};

export const createResponseValidator = ({
  operation,
  plugin,
}: ValidatorProps) => {
  if (!plugin.config.validator.response) return;

  const validator = plugin.getPlugin(plugin.config.validator.response);
  if (!validator?.api.createResponseValidator) return;

  return validator.api.createResponseValidator({
    file: plugin.gen.ensureFile(plugin.output),
    operation,
    // @ts-expect-error
    plugin: validator,
  });
};
