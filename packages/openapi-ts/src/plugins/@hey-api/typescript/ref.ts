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

export const importIdentifier = ({
  context,
  file,
  operation,
  type,
}: {
  context: IR.Context;
  file: TypeScriptFile;
  operation: IR.OperationObject;
  type: Parameters<typeof operationIrRef>[0]['type'];
}): Identifier => {
  const identifier = context.file({ id: typesId })!.identifier({
    $ref: operationIrRef({
      config: context.config,
      id: operation.id,
      type,
    }),
    namespace: 'type',
  });
  return refIdentifier(identifier, (ref) => {
    if (ref.name) {
      file.import({
        asType: true,
        module: file.relativePathToFile({ context, id: typesId }),
        name: ref.name,
      });
    }
  });
};
