import type { IRContext } from '../../../ir/context';
import type {
  OpenApiV3_0_X,
  ParameterObject,
  PathItemObject,
  PathsObject,
} from '../types/spec';
import { parseOperation } from './operation';
import {
  mergeParametersObjects,
  parametersArrayToObject,
  parseParameter,
} from './parameter';
import { parseSchema } from './schema';

export const parseV3_0_X = (context: IRContext<OpenApiV3_0_X>) => {
  const operationIds = new Map<string, string>();

  for (const path in context.spec.paths) {
    const pathItem = context.spec.paths[path as keyof PathsObject];

    const finalPathItem = pathItem.$ref
      ? {
          ...context.resolveRef<PathItemObject>(pathItem.$ref),
          ...pathItem,
        }
      : pathItem;

    const operationArgs: Omit<
      Parameters<typeof parseOperation>[0],
      'method' | 'operation'
    > & {
      operation: Omit<
        Parameters<typeof parseOperation>[0]['operation'],
        'responses'
      >;
    } = {
      context,
      operation: {
        description: finalPathItem.description,
        id: '',
        parameters: parametersArrayToObject({
          context,
          parameters: finalPathItem.parameters,
        }),
        servers: finalPathItem.servers,
        summary: finalPathItem.summary,
      },
      operationIds,
      path: path as keyof PathsObject,
    };

    if (finalPathItem.delete) {
      parseOperation({
        ...operationArgs,
        method: 'delete',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.delete,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.delete.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (finalPathItem.get) {
      parseOperation({
        ...operationArgs,
        method: 'get',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.get,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.get.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (finalPathItem.head) {
      parseOperation({
        ...operationArgs,
        method: 'head',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.head,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.head.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (finalPathItem.options) {
      parseOperation({
        ...operationArgs,
        method: 'options',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.options,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.options.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (finalPathItem.patch) {
      parseOperation({
        ...operationArgs,
        method: 'patch',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.patch,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.patch.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (finalPathItem.post) {
      parseOperation({
        ...operationArgs,
        method: 'post',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.post,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.post.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (finalPathItem.put) {
      parseOperation({
        ...operationArgs,
        method: 'put',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.put,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.put.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }

    if (finalPathItem.trace) {
      parseOperation({
        ...operationArgs,
        method: 'trace',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.trace,
          parameters: mergeParametersObjects({
            source: parametersArrayToObject({
              context,
              parameters: finalPathItem.trace.parameters,
            }),
            target: operationArgs.operation.parameters,
          }),
        },
      });
    }
  }

  // TODO: parser - handle more component types, old parser handles only parameters and schemas
  if (context.spec.components) {
    for (const name in context.spec.components.parameters) {
      const parameterOrReference = context.spec.components.parameters[name];
      const parameter =
        '$ref' in parameterOrReference
          ? context.resolveRef<ParameterObject>(parameterOrReference.$ref)
          : parameterOrReference;

      parseParameter({
        context,
        name,
        parameter,
      });
    }

    for (const name in context.spec.components.schemas) {
      const schema = context.spec.components.schemas[name];

      parseSchema({
        context,
        name,
        schema,
      });
    }
  }
};
