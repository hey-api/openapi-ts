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
  const f = plugin.gen.ensureFile(plugin.output);
  const pluginSdk = plugin.getPluginOrThrow('@hey-api/sdk');
  const typeData = operationOptionsType({
    file: f,
    operation,
    plugin: pluginSdk,
  });
  return typeData;
};

export const useTypeError = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}): string => {
  const f = plugin.gen.ensureFile(plugin.output);
  const client = getClientPlugin(plugin.context.config);
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolErrorType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('error', operation.id),
  );
  if (symbolErrorType) {
    f.addImport({
      from: symbolErrorType.file,
      typeNames: [symbolErrorType.placeholder],
    });
  }

  let typeErrorName: string | undefined = symbolErrorType?.placeholder;
  if (!typeErrorName) {
    typeErrorName = 'Error';
  }
  if (client.name === '@hey-api/client-axios') {
    const symbol = f
      .ensureSymbol({ selector: plugin.api.getSelector('AxiosError') })
      .update({ name: 'AxiosError' });
    f.addImport({
      from: 'axios',
      typeNames: [symbol.placeholder],
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
  const f = plugin.gen.ensureFile(plugin.output);
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const symbolResponseType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('response', operation.id),
  );
  if (symbolResponseType) {
    f.addImport({
      from: symbolResponseType.file,
      typeNames: [symbolResponseType.placeholder],
    });
  }
  return symbolResponseType?.placeholder || 'unknown';
};
