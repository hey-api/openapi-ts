import type { Client, Operation } from '../../common/interfaces/client';
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

  for (const url in openApi.paths) {
    const path = openApi.paths[url];
    const pathParameters = getOperationParameters({
      openApi,
      parameters: path.parameters ?? [],
      types,
    });

    for (const key in path) {
      const method = key as Lowercase<Operation['method']>;

      const operationKey = `${method.toUpperCase()} ${url}`;

      if (allowedServiceMethods.includes(method)) {
        const op = path[method]!;

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
            url,
          });
          operations.push(operation);
        }
      }
    }
  }

  return operations;
};
