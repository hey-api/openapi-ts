import type { IR } from '../../../ir/types';
import { sdkId } from './constants';
import type { HeyApiSdkPlugin } from './types';

export const createRequestValidator = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  if (!plugin.config.validator.request) {
    return;
  }

  const pluginValidator = plugin.getPlugin(plugin.config.validator.request);
  if (!pluginValidator || !pluginValidator.api.createRequestValidator) {
    return;
  }

  return pluginValidator.api.createRequestValidator({
    file: plugin.context.file({ id: sdkId })!,
    operation,
    // @ts-expect-error
    plugin: pluginValidator,
  });
};

export const createResponseValidator = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  if (!plugin.config.validator.response) {
    return;
  }

  const pluginValidator = plugin.getPlugin(plugin.config.validator.response);
  if (!pluginValidator || !pluginValidator.api.createResponseValidator) {
    return;
  }

  return pluginValidator.api.createResponseValidator({
    file: plugin.context.file({ id: sdkId })!,
    operation,
    // @ts-expect-error
    plugin: pluginValidator,
  });
};
