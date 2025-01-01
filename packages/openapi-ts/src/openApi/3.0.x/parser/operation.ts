import type { IR } from '../../../ir/types';
import {
  ensureUniqueOperationId,
  operationToId,
} from '../../shared/utils/operation';
import type {
  OperationObject,
  PathItemObject,
  RequestBodyObject,
  ResponseObject,
  SecuritySchemeObject,
} from '../types/spec';
import { contentToSchema, mediaTypeObject } from './mediaType';
import { paginationField } from './pagination';
import { schemaToIrSchema } from './schema';

interface Operation
  extends Omit<OperationObject, 'parameters'>,
    Pick<IR.OperationObject, 'id' | 'parameters'> {}

const parseOperationJsDoc = ({
  irOperation,
  operation,
}: {
  irOperation: IR.OperationObject;
  operation: Operation;
}) => {
  if (operation.deprecated !== undefined) {
    irOperation.deprecated = operation.deprecated;
  }

  if (operation.description) {
    irOperation.description = operation.description;
  }

  if (operation.summary) {
    irOperation.summary = operation.summary;
  }

  if (operation.tags?.length) {
    irOperation.tags = operation.tags;
  }
};

const initIrOperation = ({
  method,
  operation,
  path,
}: Pick<IR.OperationObject, 'method' | 'path'> & {
  operation: Operation;
}): IR.OperationObject => {
  const irOperation: IR.OperationObject = {
    id: operation.id,
    method,
    path,
  };

  parseOperationJsDoc({
    irOperation,
    operation,
  });

  return irOperation;
};

const operationToIrOperation = ({
  context,
  method,
  operation,
  path,
  securitySchemesMap,
}: Pick<IR.OperationObject, 'method' | 'path'> & {
  context: IR.Context;
  operation: Operation;
  securitySchemesMap: Map<string, SecuritySchemeObject>;
}): IR.OperationObject => {
  const irOperation = initIrOperation({ method, operation, path });

  if (operation.parameters) {
    irOperation.parameters = operation.parameters;
  }

  if (operation.requestBody) {
    const requestBody =
      '$ref' in operation.requestBody
        ? context.resolveRef<RequestBodyObject>(operation.requestBody.$ref)
        : operation.requestBody;
    const content = mediaTypeObject({
      content: requestBody.content,
    });
    if (content) {
      const pagination = paginationField({
        context,
        name: '',
        schema:
          content.schema && '$ref' in content.schema
            ? {
                allOf: [{ ...content.schema }],
                description: requestBody.description,
              }
            : {
                description: requestBody.description,
                ...content.schema,
              },
      });

      irOperation.body = {
        mediaType: content.mediaType,
        schema: schemaToIrSchema({
          context,
          schema:
            '$ref' in operation.requestBody
              ? {
                  allOf: [{ ...operation.requestBody }],
                  description: requestBody.description,
                }
              : content.schema && '$ref' in content.schema
                ? {
                    allOf: [{ ...content.schema }],
                    description: requestBody.description,
                  }
                : {
                    description: requestBody.description,
                    ...content.schema,
                  },
        }),
      };

      if (pagination) {
        irOperation.body.pagination = pagination;
      }

      if (requestBody.required) {
        irOperation.body.required = requestBody.required;
      }

      if (content.type) {
        irOperation.body.type = content.type;
      }
    }
  }

  for (const name in operation.responses) {
    if (!irOperation.responses) {
      irOperation.responses = {};
    }

    const response = operation.responses[name]!;
    const responseObject =
      '$ref' in response
        ? context.resolveRef<ResponseObject>(response.$ref)
        : response;
    const content = mediaTypeObject({
      content: responseObject.content,
    });

    if (content) {
      irOperation.responses[name] = {
        mediaType: content.mediaType,
        schema: schemaToIrSchema({
          context,
          schema: {
            description: responseObject.description,
            ...contentToSchema({ content }),
          },
        }),
      };
    } else {
      irOperation.responses[name] = {
        schema: {
          description: responseObject.description,
          // TODO: parser - cover all statues with empty response bodies
          // 1xx, 204, 205, 304
          type: name === '204' ? 'void' : 'unknown',
        },
      };
    }
  }

  if (operation.security) {
    const securitySchemeObjects: Array<IR.SecurityObject> = [];

    for (const securityRequirementObject of operation.security) {
      for (const name in securityRequirementObject) {
        const securitySchemeObject = securitySchemesMap.get(name);

        if (!securitySchemeObject) {
          continue;
        }

        securitySchemeObjects.push(securitySchemeObject);
      }
    }

    if (securitySchemeObjects.length) {
      irOperation.security = securitySchemeObjects;
    }
  }

  // TODO: parser - handle servers
  // qux: operation.servers

  return irOperation;
};

export const parseOperation = ({
  context,
  method,
  operation,
  operationIds,
  path,
  securitySchemesMap,
}: {
  context: IR.Context;
  method: Extract<
    keyof PathItemObject,
    'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put' | 'trace'
  >;
  operation: Operation;
  operationIds: Map<string, string>;
  path: keyof IR.PathsObject;
  securitySchemesMap: Map<string, SecuritySchemeObject>;
}) => {
  ensureUniqueOperationId({
    id: operation.operationId,
    method,
    operationIds,
    path,
  });

  if (!context.ir.paths) {
    context.ir.paths = {};
  }

  if (!context.ir.paths[path]) {
    context.ir.paths[path] = {};
  }

  operation.id = operationToId({
    context,
    id: operation.operationId,
    method,
    path,
  });

  context.ir.paths[path][method] = operationToIrOperation({
    context,
    method,
    operation,
    path,
    securitySchemesMap,
  });
};
