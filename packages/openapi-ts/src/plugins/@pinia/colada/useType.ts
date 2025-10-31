import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { operationOptionsType } from '~/plugins/@hey-api/sdk/shared/operation';

import type { PiniaColadaPlugin } from './types';

export const useTypeData = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}): string => {
  const pluginSdk = plugin.getPluginOrThrow('@hey-api/sdk');
  const typeData = operationOptionsType({ operation, plugin: pluginSdk });
  return typeData;
};

export const useTypeError = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}): string => {
  const client = getClientPlugin(plugin.context.config);

  const symbolErrorType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'error',
  });

  let typeErrorName: string | undefined = symbolErrorType?.placeholder;
  if (!typeErrorName) {
    typeErrorName = 'Error';
  }
  if (client.name === '@hey-api/client-axios') {
    const symbol = plugin.referenceSymbol({
      category: 'external',
      resource: 'axios.AxiosError',
    });
    typeErrorName = `${symbol.placeholder}<${typeErrorName}>`;
  }
  return typeErrorName;
};

export const useTypeResponse = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}): string => {
  const symbolResponseType = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'response',
  });
  return symbolResponseType?.placeholder || 'unknown';
};
