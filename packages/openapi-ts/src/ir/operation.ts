import type { IROperationObject } from './ir';
import type { Pagination } from './pagination';
import {
  hasParametersObjectRequired,
  parameterWithPagination,
} from './parameter';

export const hasOperationDataRequired = (
  operation: IROperationObject,
): boolean => {
  if (hasParametersObjectRequired(operation.parameters)) {
    return true;
  }

  if (operation.body?.required) {
    return true;
  }

  return false;
};

export const operationPagination = (
  operation: IROperationObject,
): Pagination | undefined => {
  if (operation.body?.pagination) {
    return {
      in: 'body',
      name:
        operation.body.pagination === true ? 'body' : operation.body.pagination,
      schema:
        operation.body.pagination === true
          ? operation.body.schema
          : operation.body.schema.properties![operation.body.pagination],
    };
  }

  return parameterWithPagination(operation.parameters);
};
