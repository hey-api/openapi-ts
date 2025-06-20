import type { ImportExportItemObject } from '../../../compiler/utils';
import type { IR } from '../../../ir/types';
import { getClientPlugin } from '../../@hey-api/client-core/utils';
import { operationOptionsType } from '../../@hey-api/sdk/operation';
import { importIdentifier } from '../../@hey-api/typescript/ref';
import type { PluginInstance } from './types';

export const useTypeData = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = plugin.context.file({ id: plugin.name })!;

  const typeData = operationOptionsType({
    context: plugin.context,
    file,
    operation,
  });
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
  const identifierError = importIdentifier({
    context: plugin.context,
    file,
    operation,
    type: 'error',
  });
  let typeError: ImportExportItemObject = {
    asType: true,
    name: identifierError.name || '',
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
  const identifierResponse = importIdentifier({
    context: plugin.context,
    file,
    operation,
    type: 'response',
  });
  const typeResponse = identifierResponse.name || 'unknown';
  return typeResponse;
};
