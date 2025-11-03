import type { Context } from '~/ir/context';
import { buildResourceMetadata } from '~/openApi/shared/graph/meta';
import { transformOpenApiSpec } from '~/openApi/shared/transforms';
import type { State } from '~/openApi/shared/types/state';
import {
  createFilteredDependencies,
  createFilters,
  hasFilters,
} from '~/openApi/shared/utils/filter';
import { buildGraph } from '~/openApi/shared/utils/graph';
import { mergeParametersObjects } from '~/openApi/shared/utils/parameter';
import { handleValidatorResult } from '~/openApi/shared/utils/validator';

import type {
  OpenApiV3_1_X,
  ParameterObject,
  PathItemObject,
  PathsObject,
  RequestBodyObject,
  SecuritySchemeObject,
} from '../types/spec';
import { filterSpec } from './filter';
import { parsePathOperation } from './operation';
import { parametersArrayToObject, parseParameter } from './parameter';
import { parseRequestBody } from './requestBody';
import { parseSchema } from './schema';
import { parseServers } from './server';
import { validateOpenApiSpec } from './validate';
import { parseWebhooks } from './webhook';

export const parseV3_1_X = (context: Context<OpenApiV3_1_X>) => {
  if (context.config.parser.validate_EXPERIMENTAL) {
    const result = validateOpenApiSpec(context.spec, context.logger);
    handleValidatorResult({ context, result });
  }

  const shouldFilterSpec = hasFilters(context.config.parser.filters);
  if (shouldFilterSpec) {
    const filters = createFilters(
      context.config.parser.filters,
      context.spec,
      context.logger,
    );
    const { graph } = buildGraph(context.spec, context.logger);
    const { resourceMetadata } = buildResourceMetadata(graph, context.logger);
    const sets = createFilteredDependencies({
      filters,
      logger: context.logger,
      resourceMetadata,
    });
    filterSpec({
      ...sets,
      logger: context.logger,
      preserveOrder: filters.preserveOrder,
      spec: context.spec,
    });
  }

  transformOpenApiSpec({ context });

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
      Parameters<typeof parsePathOperation>[0],
      'method'
    > = {
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
      parsePathOperation({
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
      parsePathOperation({
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
      parsePathOperation({
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
      parsePathOperation({
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
      parsePathOperation({
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
      parsePathOperation({
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
      parsePathOperation({
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
      parsePathOperation({
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

  parseWebhooks({ context, securitySchemesMap });
};
