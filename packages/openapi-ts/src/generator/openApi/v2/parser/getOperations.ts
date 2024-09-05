import type { Client, Operation } from '../../common/interfaces/client';
import type { Config } from '../../common/interfaces/config';
import { allowedServiceMethods } from '../../common/parser/service';
import type { OpenApi } from '../interfaces/OpenApi';
import { getOperationParameters } from './getOperationParameters';
import { getOperation } from './operation';

export const getOperations = ({
  openApi,
  types,
  config,
}: {
  config: Config;
  openApi: OpenApi;
  types: Client['types'];
}): Pick<Client, 'operationIds' | 'operations'> => {
  const operationIds = new Map<string, string>();
  const operations: Operation[] = [];

  for (const url in openApi.paths) {
    const path = openApi.paths[url];
    const pathParameters = getOperationParameters({
      config,
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

        const operation = getOperation({
          config,
          method,
          op,
          openApi,
          pathParams: pathParameters,
          types,
          url,
        });

        if (
          !config.filterFn?.operation ||
          config.filterFn?.operation(operation)
        ) {
          operations.push(operation);
        }
      }
    }
  }

  return { operationIds, operations };
};
