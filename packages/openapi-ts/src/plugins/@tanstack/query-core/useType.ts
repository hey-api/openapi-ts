import type { IR } from '../../../ir/types';
import type { ImportExportItemObject } from '../../../tsc/utils';
import { getClientPlugin } from '../../@hey-api/client-core/utils';
import { operationOptionsType } from '../../@hey-api/sdk/operation';
import { typesId } from '../../@hey-api/typescript/ref';
import type { PluginInstance } from './types';

export const useTypeData = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const pluginSdk = plugin.getPlugin('@hey-api/sdk')!;
  const typeData = operationOptionsType({ file, operation, plugin: pluginSdk });
  return typeData;
};

export const useTypeError = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const errorImport = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'error' }),
    ),
  });
  let typeError: ImportExportItemObject = {
    asType: true,
    name: errorImport.name || '',
  };
  if (!typeError.name) {
    typeError = file.import({
      asType: true,
      module: plugin.name,
      name: 'DefaultError',
    });
  }
  const client = getClientPlugin(plugin.context.config);
  if (client.name === '@hey-api/client-axios') {
    const axiosError = file.import({
      asType: true,
      module: 'axios',
      name: 'AxiosError',
    });
    typeError = {
      ...axiosError,
      name: `${axiosError.name}<${typeError.name}>`,
    };
  }
  return typeError;
};

export const useTypeResponse = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const responseImport = file.import({
    asType: true,
    module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    name: fileTypeScript.getName(
      pluginTypeScript.api.getId({ operation, type: 'response' }),
    ),
  });

  const typeResponse = responseImport.name || 'unknown';
  return typeResponse;
};
