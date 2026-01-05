import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { operationOptionsType } from '~/plugins/@hey-api/sdk/shared/operation';
import { $ } from '~/ts-dsl';

import type { PluginInstance } from '../types';

export const useTypeData = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): ReturnType<typeof $.type> => {
  const pluginSdk = plugin.getPluginOrThrow('@hey-api/sdk');
  return operationOptionsType({ operation, plugin: pluginSdk });
};

export const useTypeError = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): ReturnType<typeof $.type> => {
  const client = getClientPlugin(plugin.context.config);
  const symbolErrorType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'error',
  });
  const symbolError =
    symbolErrorType || plugin.external(`${plugin.name}.DefaultError`);
  if (client.name === '@hey-api/client-axios') {
    const symbol = plugin.external('axios.AxiosError');
    return $.type(symbol).generic(symbolError);
  }
  return $.type(symbolError);
};

export const useTypeResponse = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): ReturnType<typeof $.type> => {
  const symbolResponseType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'response',
  });
  return $.type(symbolResponseType ?? 'unknown');
};
