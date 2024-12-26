import type { ImportExportItemObject } from '../../../compiler/utils';
import type { IR } from '../../../ir/types';
import { operationOptionsType } from '../../@hey-api/sdk/plugin';
import { operationIrRef } from '../../shared/utils/ref';
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
  const identifierData = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'data' }),
    namespace: 'type',
  });
  if (identifierData.name) {
    const file = context.file({ id: plugin.name })!;
    file.import({
      asType: true,
      module: context
        .file({ id: plugin.name })!
        .relativePathToFile({ context, id: 'types' }),
      name: identifierData.name,
    });
  }
  const typeData = operationOptionsType({
    importedType: identifierData.name,
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
  const identifierError = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'error' }),
    namespace: 'type',
  });
  if (identifierError.name) {
    file.import({
      asType: true,
      module: context
        .file({ id: plugin.name })!
        .relativePathToFile({ context, id: 'types' }),
      name: identifierError.name,
    });
  }
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
  const identifierResponse = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'response' }),
    namespace: 'type',
  });
  if (identifierResponse.name) {
    const file = context.file({ id: plugin.name })!;
    file.import({
      asType: true,
      module: context
        .file({ id: plugin.name })!
        .relativePathToFile({ context, id: 'types' }),
      name: identifierResponse.name,
    });
  }
  const typeResponse = identifierResponse.name || 'unknown';
  return typeResponse;
};
