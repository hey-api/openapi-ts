import type { IR } from '../../../ir/types';
import { buildResourceMetadata } from '../../shared/graph/meta';
import { transformOpenApiSpec } from '../../shared/transforms';
import type { State } from '../../shared/types/state';
import {
  createFilteredDependencies,
  createFilters,
  hasFilters,
} from '../../shared/utils/filter';
import { buildGraph } from '../../shared/utils/graph';
import { mergeParametersObjects } from '../../shared/utils/parameter';
import { handleValidatorResult } from '../../shared/utils/validator';
import type {
  OpenApiV2_0_X,
  OperationObject,
  PathItemObject,
  PathsObject,
  SecuritySchemeObject,
} from '../types/spec';
import { filterSpec } from './filter';
import { parseOperation } from './operation';
import { parametersArrayToObject } from './parameter';
import { parseSchema } from './schema';
import { parseServers } from './server';
import { validateOpenApiSpec } from './validate';

type PathKeys<T extends keyof PathsObject = keyof PathsObject> =
  keyof T extends infer K ? (K extends `/${string}` ? K : never) : never;

export const parseV2_0_X = (context: IR.Context<OpenApiV2_0_X>) => {
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

  for (const name in context.spec.securityDefinitions) {
    const securitySchemeObject = context.spec.securityDefinitions[name]!;
    securitySchemesMap.set(name, securitySchemeObject);
  }

  if (context.spec.definitions) {
    for (const name in context.spec.definitions) {
      const $ref = `#/definitions/${name}`;
      const schema = context.spec.definitions[name]!;

      parseSchema({
        $ref,
        context,
        schema,
      });
    }
  }

  parseServers({ context });

  for (const path in context.spec.paths) {
    if (path.startsWith('x-')) {
      continue;
    }

    const pathItem = context.spec.paths[path as PathKeys]!;

    const finalPathItem = pathItem.$ref
      ? {
          ...context.resolveRef<PathItemObject>(pathItem.$ref),
          ...pathItem,
        }
      : pathItem;

    const commonOperation: OperationObject = {
      consumes: context.spec.consumes,
      produces: context.spec.produces,
      responses: {},
      security: context.spec.security,
    };
    const operationArgs: Omit<Parameters<typeof parseOperation>[0], 'method'> =
      {
        context,
        operation: {
          ...commonOperation,
          parameters: parametersArrayToObject({
            context,
            operation: commonOperation,
            parameters: finalPathItem.parameters,
          }),
        },
        path: path as PathKeys,
        securitySchemesMap,
        state,
      };

    if (finalPathItem.delete) {
      const parameters = mergeParametersObjects({
        source: parametersArrayToObject({
          context,
          operation: finalPathItem.delete,
          parameters: finalPathItem.delete.parameters,
        }),
        target: operationArgs.operation.parameters,
      });
      parseOperation({
        ...operationArgs,
        method: 'delete',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.delete,
          parameters,
        },
      });
    }

    if (finalPathItem.get) {
      const parameters = mergeParametersObjects({
        source: parametersArrayToObject({
          context,
          operation: finalPathItem.get,
          parameters: finalPathItem.get.parameters,
        }),
        target: operationArgs.operation.parameters,
      });
      parseOperation({
        ...operationArgs,
        method: 'get',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.get,
          parameters,
        },
      });
    }

    if (finalPathItem.head) {
      const parameters = mergeParametersObjects({
        source: parametersArrayToObject({
          context,
          operation: finalPathItem.head,
          parameters: finalPathItem.head.parameters,
        }),
        target: operationArgs.operation.parameters,
      });
      parseOperation({
        ...operationArgs,
        method: 'head',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.head,
          parameters,
        },
      });
    }

    if (finalPathItem.options) {
      const parameters = mergeParametersObjects({
        source: parametersArrayToObject({
          context,
          operation: finalPathItem.options,
          parameters: finalPathItem.options.parameters,
        }),
        target: operationArgs.operation.parameters,
      });
      parseOperation({
        ...operationArgs,
        method: 'options',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.options,
          parameters,
        },
      });
    }

    if (finalPathItem.patch) {
      const parameters = mergeParametersObjects({
        source: parametersArrayToObject({
          context,
          operation: finalPathItem.patch,
          parameters: finalPathItem.patch.parameters,
        }),
        target: operationArgs.operation.parameters,
      });
      parseOperation({
        ...operationArgs,
        method: 'patch',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.patch,
          parameters,
        },
      });
    }

    if (finalPathItem.post) {
      const parameters = mergeParametersObjects({
        source: parametersArrayToObject({
          context,
          operation: finalPathItem.post,
          parameters: finalPathItem.post.parameters,
        }),
        target: operationArgs.operation.parameters,
      });
      parseOperation({
        ...operationArgs,
        method: 'post',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.post,
          parameters,
        },
      });
    }

    if (finalPathItem.put) {
      const parameters = mergeParametersObjects({
        source: parametersArrayToObject({
          context,
          operation: finalPathItem.put,
          parameters: finalPathItem.put.parameters,
        }),
        target: operationArgs.operation.parameters,
      });
      parseOperation({
        ...operationArgs,
        method: 'put',
        operation: {
          ...operationArgs.operation,
          ...finalPathItem.put,
          parameters,
        },
      });
    }
  }
};
