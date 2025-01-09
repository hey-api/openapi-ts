import type { Identifier, TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import { operationIrRef } from '../../shared/utils/ref';

export const typesId = 'types';

function refIdentifier<T extends Identifier>(
  identifier: T,
  onGet?: (identifier: T) => void,
): T {
  return {
    ...identifier,
    get name() {
      onGet?.(identifier);
      return identifier.name;
    },
  };
}

export const importIdentifierData = ({
  context,
  file,
  operation,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
}): Identifier => {
  const identifierData = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'data' }),
    namespace: 'type',
  });
  return refIdentifier(identifierData, (identifier) => {
    if (identifier.name) {
      file.import({
        asType: true,
        module: file.relativePathToFile({ context, id: 'types' }),
        name: identifier.name,
      });
    }
  });
};

export const importIdentifierError = ({
  context,
  file,
  operation,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
}): Identifier => {
  const identifierError = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'error' }),
    namespace: 'type',
  });
  return refIdentifier(identifierError, (identifier) => {
    if (identifier.name) {
      file.import({
        asType: true,
        module: file.relativePathToFile({ context, id: 'types' }),
        name: identifier.name,
      });
    }
  });
};

export const importIdentifierResponse = ({
  context,
  file,
  operation,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
}): Identifier => {
  const identifierResponse = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'response' }),
    namespace: 'type',
  });
  return refIdentifier(identifierResponse, (identifier) => {
    if (identifier.name) {
      file.import({
        asType: true,
        module: file.relativePathToFile({ context, id: 'types' }),
        name: identifier.name,
      });
    }
  });
};
