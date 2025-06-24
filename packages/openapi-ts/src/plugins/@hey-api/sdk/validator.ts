import type { IR } from '../../../ir/types';
import type { Plugin } from '../../types';
import { sdkId } from './constants';
import type { HeyApiSdkPlugin } from './types';

export const createResponseValidator = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: Plugin.Instance<HeyApiSdkPlugin>;
}) => {
  if (!plugin.config.validator.response) {
    return;
  }

  const pluginValidator = plugin.getPlugin(plugin.config.validator.response);
  if (!pluginValidator) {
    return;
  }

  const file = plugin.context.file({ id: sdkId })!;

  switch (pluginValidator.name) {
    case 'valibot':
      return pluginValidator.api.createResponseValidator({ file, operation, plugin: pluginValidator });
    case 'zod':
      return pluginValidator.api.createResponseValidator({ file, operation, plugin: pluginValidator });
    default:
      return;
  }
};
