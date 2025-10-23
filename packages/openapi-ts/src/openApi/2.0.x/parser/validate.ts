import { createOperationKey } from '~/ir/operation';
import { httpMethods } from '~/openApi/shared/utils/operation';
import type {
  ValidatorIssue,
  ValidatorResult,
} from '~/openApi/shared/utils/validator';
import type { Logger } from '~/utils/logger';

import type { OpenApiV2_0_X, PathItemObject, PathsObject } from '../types/spec';

export const validateOpenApiSpec = (
  spec: OpenApiV2_0_X,
  logger: Logger,
): ValidatorResult => {
  const eventValidate = logger.timeEvent('validate');
  const issues: Array<ValidatorIssue> = [];
  const operationIds = new Map();

  if (spec.paths) {
    for (const entry of Object.entries(spec.paths)) {
      const path = entry[0] as keyof PathsObject;
      const pathItem = entry[1] as PathItemObject;
      for (const method of httpMethods) {
        if (method === 'trace') {
          continue;
        }

        const operation = pathItem[method];
        if (!operation) {
          continue;
        }

        const operationKey = createOperationKey({ method, path });

        if (operation.operationId) {
          if (!operationIds.has(operation.operationId)) {
            operationIds.set(operation.operationId, operationKey);
          } else {
            issues.push({
              code: 'duplicate_key',
              context: {
                key: 'operationId',
                value: operation.operationId,
              },
              message:
                'Duplicate `operationId` found. Each `operationId` must be unique.',
              path: ['paths', path, method, 'operationId'],
              severity: 'error',
            });
          }
        }
      }
    }
  }

  eventValidate.timeEnd();
  return {
    issues,
    valid: !issues.some((issue) => issue.severity === 'error'),
  };
};
