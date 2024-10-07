import type { OpenApiV3_1, PathsObject } from '../types/spec';
import { parseOperation } from './operation';

export const parseV3_1 = (spec: OpenApiV3_1) => {
  const operationIds = new Map<string, string>();

  for (const path in spec.paths) {
    const pathItem = spec.paths[path as keyof PathsObject];

    if (pathItem.delete) {
      parseOperation({
        method: 'DELETE',
        operation: pathItem.delete,
        operationIds,
        path,
      });
    }

    if (pathItem.get) {
      parseOperation({
        method: 'GET',
        operation: pathItem.get,
        operationIds,
        path,
      });
    }

    if (pathItem.head) {
      parseOperation({
        method: 'HEAD',
        operation: pathItem.head,
        operationIds,
        path,
      });
    }

    if (pathItem.options) {
      parseOperation({
        method: 'OPTIONS',
        operation: pathItem.options,
        operationIds,
        path,
      });
    }

    if (pathItem.patch) {
      parseOperation({
        method: 'PATCH',
        operation: pathItem.patch,
        operationIds,
        path,
      });
    }

    if (pathItem.post) {
      parseOperation({
        method: 'POST',
        operation: pathItem.post,
        operationIds,
        path,
      });
    }

    if (pathItem.put) {
      parseOperation({
        method: 'PUT',
        operation: pathItem.put,
        operationIds,
        path,
      });
    }

    if (pathItem.trace) {
      parseOperation({
        method: 'TRACE',
        operation: pathItem.trace,
        operationIds,
        path,
      });
    }
  }
};
