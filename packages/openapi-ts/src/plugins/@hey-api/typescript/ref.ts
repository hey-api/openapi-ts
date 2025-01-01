import type { TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import { operationIrRef } from '../../shared/utils/ref';

export const typesId = 'types';

export const importIdentifierData = ({
  context,
  file,
  operation,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
}): ReturnType<TypeScriptFile['identifier']> => {
  const identifierData = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'data' }),
    namespace: 'type',
  });
  if (identifierData.name) {
    file.import({
      asType: true,
      module: file.relativePathToFile({ context, id: 'types' }),
      name: identifierData.name,
    });
  }
  return identifierData;
};

export const importIdentifierError = ({
  context,
  file,
  operation,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
}): ReturnType<TypeScriptFile['identifier']> => {
  const identifierError = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'error' }),
    namespace: 'type',
  });
  if (identifierError.name) {
    file.import({
      asType: true,
      module: file.relativePathToFile({ context, id: 'types' }),
      name: identifierError.name,
    });
  }
  return identifierError;
};

export const importIdentifierResponse = ({
  context,
  file,
  operation,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
}): ReturnType<TypeScriptFile['identifier']> => {
  const identifierResponse = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'response' }),
    namespace: 'type',
  });
  if (identifierResponse.name) {
    file.import({
      asType: true,
      module: file.relativePathToFile({ context, id: 'types' }),
      name: identifierResponse.name,
    });
  }
  return identifierResponse;
};
