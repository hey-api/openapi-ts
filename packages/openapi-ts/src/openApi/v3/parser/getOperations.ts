import { getConfig } from '../../../utils/config';
import type { Client, Operation } from '../../common/interfaces/client';
import {
  getOperationKey,
  operationFilterFn,
} from '../../common/parser/operation';
import { allowedServiceMethods } from '../../common/parser/service';
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
  const operationIds = new Map<string, string>();
  const operations: Operation[] = [];

  for (const path in openApi.paths) {
    const pathItem = openApi.paths[path]!;
    const pathParameters = getOperationParameters({
      openApi,
      parameters: pathItem.parameters ?? [],
      types,
    });

    for (const name in pathItem) {
      const method = name as Lowercase<Operation['method']>;

      const operationKey = getOperationKey({
        method,
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
          operationFilterFn({
            config: getConfig(),
            operationKey,
          })
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
