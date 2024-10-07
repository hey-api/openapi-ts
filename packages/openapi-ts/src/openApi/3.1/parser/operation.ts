import { getConfig } from '../../../utils/config';
import type { OperationObject } from '../types/spec';

export const parseOperation = ({
  method,
  operation,
  operationIds,
  path,
}: {
  method: string;
  operation: OperationObject;
  operationIds: Map<string, string>;
  path: string;
}) => {
  const operationKey = `${method} ${path}`;

  const config = getConfig();

  // TODO: filter function, move services to plugin, cleaner syntax
  const regexp = config.services.filter
    ? new RegExp(config.services.filter)
    : undefined;
  if (regexp && !regexp.test(operationKey)) {
    return;
  }

  // TODO: support throw on duplicate
  if (operation.operationId) {
    if (operationIds.has(operation.operationId)) {
      console.warn(
        `❗️ Duplicate operationId: ${operation.operationId} in ${operationKey}. Please ensure your operation IDs are unique. This behavior is not supported and will likely lead to unexpected results.`,
      );
    } else {
      operationIds.set(operation.operationId, operationKey);
    }
  }

  console.log(operation);
};
