import type { IR } from '../../../ir/types';
import { getClientPlugin } from '../../@hey-api/client-core/utils';
import { operationOptionsType } from '../../@hey-api/sdk/operation';
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
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolErrorType = plugin.getSymbol(
    pluginTypeScript.api.getSelector('error', operation.id),
  );

  let typeErrorName: string | undefined = symbolErrorType?.placeholder;
  if (!typeErrorName) {
    typeErrorName = 'Error';
  }
  if (client.name === '@hey-api/client-axios') {
    const symbol = plugin.referenceSymbol(plugin.api.getSelector('AxiosError'));
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
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolResponseType = plugin.getSymbol(
    pluginTypeScript.api.getSelector('response', operation.id),
  );
  return symbolResponseType?.placeholder || 'unknown';
};
