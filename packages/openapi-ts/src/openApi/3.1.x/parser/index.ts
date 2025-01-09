import type { IR } from '../../../ir/types';
import { canProcessRef } from '../../shared/utils/filter';
import { mergeParametersObjects } from '../../shared/utils/parameter';
import type {
  OpenApiV3_1_X,
  ParameterObject,
  PathItemObject,
  PathsObject,
  RequestBodyObject,
  SecuritySchemeObject,
} from '../types/spec';
import { parseOperation } from './operation';
import { parametersArrayToObject, parseParameter } from './parameter';
import { parseRequestBody } from './requestBody';
import { parseSchema } from './schema';

export const parseV3_1_X = (context: IR.Context<OpenApiV3_1_X>) => {
  const operationIds = new Map<string, string>();
  const securitySchemesMap = new Map<string, SecuritySchemeObject>();

  const excludeRegExp = context.config.input.exclude
    ? new RegExp(context.config.input.exclude)
    : undefined;
  const includeRegExp = context.config.input.include
    ? new RegExp(context.config.input.include)
    : undefined;

  const shouldProcessRef = ($ref: string) =>
    canProcessRef({
      $ref,
      excludeRegExp,
      includeRegExp,
    });

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
      if (!shouldProcessRef($ref)) {
        continue;
      }

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
      if (!shouldProcessRef($ref)) {
        continue;
      }

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
      if (!shouldProcessRef($ref)) {
        continue;
      }

      const schema = context.spec.components.schemas[name]!;

      parseSchema({
        $ref,
        context,
        schema,
      });
    }
  }

  for (const path in context.spec.paths) {
    const pathItem = context.spec.paths[path as keyof PathsObject]!;

    const finalPathItem = pathItem.$ref
      ? {
          ...context.resolveRef<PathItemObject>(pathItem.$ref),
          ...pathItem,
        }
      : pathItem;

    const operationArgs: Omit<Parameters<typeof parseOperation>[0], 'method'> =
      {
        context,
        operation: {
          description: finalPathItem.description,
          id: '',
          parameters: parametersArrayToObject({
            context,
            parameters: finalPathItem.parameters,
          }),
          security: context.spec.security,
          servers: finalPathItem.servers,
          summary: finalPathItem.summary,
        },
        operationIds,
        path: path as keyof PathsObject,
        securitySchemesMap,
      };

    const $refDelete = `#/paths${path}/delete`;
    if (finalPathItem.delete && shouldProcessRef($refDelete)) {
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

    const $refGet = `#/paths${path}/get`;
    if (finalPathItem.get && shouldProcessRef($refGet)) {
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

    const $refHead = `#/paths${path}/head`;
    if (finalPathItem.head && shouldProcessRef($refHead)) {
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

    const $refOptions = `#/paths${path}/options`;
    if (finalPathItem.options && shouldProcessRef($refOptions)) {
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

    const $refPatch = `#/paths${path}/patch`;
    if (finalPathItem.patch && shouldProcessRef($refPatch)) {
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

    const $refPost = `#/paths${path}/post`;
    if (finalPathItem.post && shouldProcessRef($refPost)) {
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

    const $refPut = `#/paths${path}/put`;
    if (finalPathItem.put && shouldProcessRef($refPut)) {
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

    const $refTrace = `#/paths${path}/trace`;
    if (finalPathItem.trace && shouldProcessRef($refTrace)) {
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
