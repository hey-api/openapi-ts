import type { IR } from '../../../ir/types';
import type { State } from '../../shared/types/state';
import {
  createFilteredDependencies,
  createFilters,
  hasFilters,
} from '../../shared/utils/filter';
import type { Graph } from '../../shared/utils/graph';
import { mergeParametersObjects } from '../../shared/utils/parameter';
import { hasTransforms } from '../../shared/utils/transform';
import { handleValidatorResult } from '../../shared/utils/validator';
import type {
  OpenApiV3_0_X,
  ParameterObject,
  PathItemObject,
  PathsObject,
  RequestBodyObject,
  SecuritySchemeObject,
} from '../types/spec';
import { filterSpec } from './filter';
import { createGraph } from './graph';
import { parseOperation } from './operation';
import { parametersArrayToObject, parseParameter } from './parameter';
import { parseRequestBody } from './requestBody';
import { parseSchema } from './schema';
import { parseServers } from './server';

export const parseV3_0_X = (context: IR.Context<OpenApiV3_0_X>) => {
  const shouldFilterSpec = hasFilters(context.config.parser.filters);
  const shouldTransformSpec = hasTransforms(context.config.parser.transforms);

  let graph: Graph | undefined;

  if (
    shouldFilterSpec ||
    shouldTransformSpec ||
    context.config.parser.validate_EXPERIMENTAL
  ) {
    const result = createGraph({
      spec: context.spec,
      transforms: context.config.parser.transforms,
      validate: Boolean(context.config.parser.validate_EXPERIMENTAL),
    });
    graph = result.graph;
    handleValidatorResult({ context, result });
  }

  if (shouldFilterSpec && graph) {
    const filters = createFilters(context.config.parser.filters, context.spec);
    const sets = createFilteredDependencies({ filters, graph });
    filterSpec({
      ...sets,
      preserveOrder: filters.preserveOrder,
      spec: context.spec,
    });
  }

  const state: State = {
    ids: new Map(),
  };
  const securitySchemesMap = new Map<string, SecuritySchemeObject>();

  // TODO: parser - handle more component types, old parser handles only parameters and schemas
  if (context.spec.components) {
    for (const name in context.spec.components.securitySchemes) {
      const securityOrReference =
        context.spec.components.securitySchemes[name]!;
      const securitySchemeObject =
        '$ref' in securityOrReference
          ? context.resolveRef<SecuritySchemeObject>(securityOrReference.$ref)
          : securityOrReference;
      securitySchemesMap.set(name, securitySchemeObject);
    }

    for (const name in context.spec.components.parameters) {
      const $ref = `#/components/parameters/${name}`;
      const parameterOrReference = context.spec.components.parameters[name]!;
      const parameter =
        '$ref' in parameterOrReference
          ? context.resolveRef<ParameterObject>(parameterOrReference.$ref)
          : parameterOrReference;

      parseParameter({
        $ref,
        context,
        parameter,
      });
    }

    for (const name in context.spec.components.requestBodies) {
      const $ref = `#/components/requestBodies/${name}`;
      const requestBodyOrReference =
        context.spec.components.requestBodies[name]!;
      const requestBody =
        '$ref' in requestBodyOrReference
          ? context.resolveRef<RequestBodyObject>(requestBodyOrReference.$ref)
          : requestBodyOrReference;

      parseRequestBody({
        $ref,
        context,
        requestBody,
      });
    }

    for (const name in context.spec.components.schemas) {
      const $ref = `#/components/schemas/${name}`;
      const schema = context.spec.components.schemas[name]!;

      parseSchema({
        $ref,
        context,
        schema,
      });
    }
  }

  parseServers({ context });

  for (const path in context.spec.paths) {
    const pathItem = context.spec.paths[path as keyof PathsObject]!;

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
        parameters: parametersArrayToObject({
          context,
          parameters: finalPathItem.parameters,
        }),
        security: context.spec.security,
        servers: finalPathItem.servers,
        summary: finalPathItem.summary,
      },
      path: path as keyof PathsObject,
      securitySchemesMap,
      state,
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
};
