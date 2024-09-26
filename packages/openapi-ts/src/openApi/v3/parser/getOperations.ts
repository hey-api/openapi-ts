import type { Client, Operation } from '../../common/interfaces/client';
import { getOperationKey } from '../../common/parser/operation';
import { allowedServiceMethods } from '../../common/parser/service';
import { getConfig } from '../../config';
import type { OpenApi } from '../interfaces/OpenApi';
import { getOperationParameters } from './getOperationParameters';
import { getOperation } from './operation';

export const getOperations = ({
  openApi,
  types,
}: {
  openApi: OpenApi;
  types: Client['types'];
}): Operation[] => {
  const config = getConfig();

  const operationIds = new Map<string, string>();
  const operations: Operation[] = [];

  for (const path in openApi.paths) {
    const pathItem = openApi.paths[path];
    const pathParameters = getOperationParameters({
      openApi,
      parameters: pathItem.parameters ?? [],
      types,
    });

    for (const key in pathItem) {
      const method = key as Lowercase<Operation['method']>;

      const operationKey = getOperationKey({
        method: method.toUpperCase(),
        path,
      });

      if (allowedServiceMethods.includes(method)) {
        const op = pathItem[method]!;

        if (op.operationId) {
          if (operationIds.has(op.operationId)) {
            console.warn(
              `❗️ Duplicate operationId: ${op.operationId} in ${operationKey}. Please ensure your operation IDs are unique. This behavior is not supported and will likely lead to unexpected results.`,
            );
          } else {
            operationIds.set(op.operationId, operationKey);
          }
        }

        if (
          !config.filterFn?.operation ||
          config.filterFn?.operation(operationKey)
        ) {
          const operation = getOperation({
            method,
            op,
            openApi,
            pathParams: pathParameters,
            types,
            url: path,
          });
          operations.push(operation);
        }
      }
    }
  }

  return operations;
};
