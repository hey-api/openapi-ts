import type { IR } from '../../../ir/ir';
import type { OpenApiV3_1, PathsObject } from '../types/spec';
import { parseOperation } from './operation';
import { mergeParametersObjects, parametersArrayToObject } from './parameter';

export const parseV3_1 = (spec: OpenApiV3_1): IR => {
  const operationIds = new Map<string, string>();

  const ir: IR = {};

  for (const path in spec.paths) {
    const pathItem = spec.paths[path as keyof PathsObject];

    // TODO: parser - resolve PathItemObject $ref + behavior

    const operationArgs: Omit<Parameters<typeof parseOperation>[0], 'method'> =
      {
        ir,
        operation: {
          description: pathItem.description,
          parameters: parametersArrayToObject({
            parameters: pathItem.parameters,
          }),
          servers: pathItem.servers,
          summary: pathItem.summary,
        },
        operationIds,
        path: path as keyof PathsObject,
      };

    if (pathItem.delete) {
      parseOperation({
        ...operationArgs,
        method: 'delete',
        operation: {
          ...operationArgs.operation,
          ...pathItem.delete,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.delete.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (pathItem.get) {
      parseOperation({
        ...operationArgs,
        method: 'get',
        operation: {
          ...operationArgs.operation,
          ...pathItem.get,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.get.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (pathItem.head) {
      parseOperation({
        ...operationArgs,
        method: 'head',
        operation: {
          ...operationArgs.operation,
          ...pathItem.head,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.head.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (pathItem.options) {
      parseOperation({
        ...operationArgs,
        method: 'options',
        operation: {
          ...operationArgs.operation,
          ...pathItem.options,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.options.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (pathItem.patch) {
      parseOperation({
        ...operationArgs,
        method: 'patch',
        operation: {
          ...operationArgs.operation,
          ...pathItem.patch,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.patch.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (pathItem.post) {
      parseOperation({
        ...operationArgs,
        method: 'post',
        operation: {
          ...operationArgs.operation,
          ...pathItem.post,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.post.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (pathItem.put) {
      parseOperation({
        ...operationArgs,
        method: 'put',
        operation: {
          ...operationArgs.operation,
          ...pathItem.put,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.put.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (pathItem.trace) {
      parseOperation({
        ...operationArgs,
        method: 'trace',
        operation: {
          ...operationArgs.operation,
          ...pathItem.trace,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              parameters: pathItem.trace.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }
  }

  // console.warn(ir)
  return ir;
};
