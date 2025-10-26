import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import { operationOptionsType } from '~/plugins/@hey-api/sdk/shared/operation';

import type { PluginInstance } from './types';

export const useTypeData = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
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
  plugin: PluginInstance;
}): string => {
  const client = getClientPlugin(plugin.context.config);
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolErrorType = plugin.getSymbol(
    pluginTypeScript.api.selector('error', operation.id),
  );

  let typeErrorName: string | undefined = symbolErrorType?.placeholder;
  if (!typeErrorName) {
    const symbol = plugin.referenceSymbol(plugin.api.selector('DefaultError'));
    typeErrorName = symbol.placeholder;
  }
  if (client.name === '@hey-api/client-axios') {
    const symbol = plugin.referenceSymbol(plugin.api.selector('AxiosError'));
    typeErrorName = `${symbol.placeholder}<${typeErrorName}>`;
  }
  return typeErrorName;
};

export const useTypeResponse = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): string => {
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolResponseType = plugin.getSymbol(
    pluginTypeScript.api.selector('response', operation.id),
  );
  return symbolResponseType?.placeholder || 'unknown';
};
