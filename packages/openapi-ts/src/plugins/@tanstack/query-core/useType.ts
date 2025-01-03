import type { ImportExportItemObject } from '../../../compiler/utils';
import type { IR } from '../../../ir/types';
import { operationOptionsType } from '../../@hey-api/sdk/plugin';
import {
  importIdentifierData,
  importIdentifierError,
  importIdentifierResponse,
} from '../../@hey-api/typescript/ref';
import type { PluginInstance } from './types';

export const useTypeData = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;

  const identifierData = importIdentifierData({ context, file, operation });
  // TODO: import error type only if we are sure we are going to use it
  // const identifierError = importIdentifierError({ context, file, operation });

  const typeData = operationOptionsType({
    context,
    identifierData,
    // identifierError,
  });
  return typeData;
};

export const useTypeError = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;
  const identifierError = importIdentifierError({ context, file, operation });
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
  if (context.config.client.name === '@hey-api/client-axios') {
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
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });
  const typeResponse = identifierResponse.name || 'unknown';
  return typeResponse;
};
