import type { IR, IRParametersObject, IRPathsObject } from '../../../ir/ir';
import { getConfig } from '../../../utils/config';
import type { OperationObject, PathItemObject } from '../types/spec';

export const parseOperation = ({
  ir,
  method,
  operation,
  operationIds,
  path,
}: {
  ir: IR;
  method: Extract<
    keyof PathItemObject,
    'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put' | 'trace'
  >;
  operation: Omit<OperationObject, 'parameters'> & {
    parameters?: IRParametersObject;
  };
  operationIds: Map<string, string>;
  path: keyof IRPathsObject;
}) => {
  const operationKey = `${method.toUpperCase()} ${path}`;

  const config = getConfig();

  // TODO: parser - filter function, move services to plugin, cleaner syntax
  const regexp = config.services.filter
    ? new RegExp(config.services.filter)
    : undefined;
  if (regexp && !regexp.test(operationKey)) {
    return;
  }

  // TODO: parser - support throw on duplicate
  if (operation.operationId) {
    if (operationIds.has(operation.operationId)) {
      console.warn(
        `❗️ Duplicate operationId: ${operation.operationId} in ${operationKey}. Please ensure your operation IDs are unique. This behavior is not supported and will likely lead to unexpected results.`,
      );
    } else {
      operationIds.set(operation.operationId, operationKey);
    }
  }

  if (!ir.paths) {
    ir.paths = {};
  }

  if (!ir.paths[path]) {
    ir.paths[path] = {};
  }

  ir.paths[path][method] = operation;
  // console.warn(operation);
};
