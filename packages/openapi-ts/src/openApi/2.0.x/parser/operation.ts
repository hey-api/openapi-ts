import type { IR, IRBodyObject } from '../../../ir/types';
import type { State } from '../../shared/types/state';
import { operationToId } from '../../shared/utils/operation';
import type {
  OperationObject,
  ParameterObject,
  PathItemObject,
  ResponseObject,
  SchemaObject,
  SecuritySchemeObject,
} from '../types/spec';
import { contentToSchema, mediaTypeObjects } from './mediaType';
import { paginationField } from './pagination';
import { schemaToIrSchema } from './schema';

interface Operation
  extends Omit<OperationObject, 'parameters'>,
    Pick<IR.OperationObject, 'parameters'> {
  requestBody?: OperationObject['parameters'];
}

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
  context,
  method,
  operation,
  path,
  state,
}: Pick<IR.OperationObject, 'method' | 'path'> & {
  context: IR.Context;
  operation: Operation;
  state: State;
}): IR.OperationObject => {
  const irOperation: IR.OperationObject = {
    id: operationToId({
      context,
      id: operation.operationId,
      method,
      path,
      state,
    }),
    method,
    path,
  };

  if (operation.operationId) {
    irOperation.operationId = operation.operationId;
  }

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
  state,
}: Pick<IR.OperationObject, 'method' | 'path'> & {
  context: IR.Context;
  operation: Operation;
  securitySchemesMap: Map<string, SecuritySchemeObject>;
  state: State;
}): IR.OperationObject => {
  const irOperation = initIrOperation({
    context,
    method,
    operation,
    path,
    state,
  });

  if (operation.parameters) {
    irOperation.parameters = operation.parameters;
  }

  let isRequestBodyRequired = false;
  const requestBodyObject: IRBodyObject = {
    mediaType: '',
    schema: {
      properties: {},
      required: [],
      type: 'object',
    },
  };
  const requestBodyObjectRequired: Array<string> = [];

  for (const requestBodyParameter of operation.requestBody ?? []) {
    const requestBody =
      '$ref' in requestBodyParameter
        ? context.resolveRef<ParameterObject>(requestBodyParameter.$ref)
        : requestBodyParameter;
    const schema: SchemaObject =
      requestBody.in === 'body'
        ? requestBody.schema
        : {
            ...requestBody,
            format: requestBody.type === 'file' ? 'binary' : requestBody.format,
            required: undefined,
            type: requestBody.type === 'file' ? 'string' : requestBody.type,
          };
    const contents = mediaTypeObjects({
      mimeTypes: operation.consumes,
      response: { schema },
    });
    // TODO: add support for multiple content types, for now prefer JSON
    const content =
      contents.find((content) => content.type === 'json') || contents[0];

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

      const irSchema = schemaToIrSchema({
        context,
        schema:
          '$ref' in requestBody
            ? {
                allOf: [
                  {
                    ...requestBody,
                    $ref: requestBody.$ref as string,
                    required: [],
                    type: 'string',
                  },
                ],
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
        state: undefined,
      });

      requestBodyObject.mediaType = content.mediaType;

      if (requestBody.in === 'body') {
        requestBodyObject.schema = irSchema;
      } else {
        requestBodyObject.schema.properties![requestBody.name] = irSchema;

        if (requestBody.required) {
          requestBodyObjectRequired.push(requestBody.name);
        }
      }

      if (pagination) {
        requestBodyObject.pagination = pagination;
      }

      if (content.type) {
        requestBodyObject.type = content.type;
      }
    }

    if (requestBody.required) {
      isRequestBodyRequired = true;
    }
  }

  if (requestBodyObject.mediaType) {
    if (requestBodyObjectRequired.length) {
      requestBodyObject.schema.required = requestBodyObjectRequired;
    }

    irOperation.body = requestBodyObject;

    if (isRequestBodyRequired) {
      irOperation.body.required = isRequestBodyRequired;
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
    const contents = mediaTypeObjects({
      // assume JSON by default
      mimeTypes: operation.produces ? operation.produces : ['application/json'],
      response: responseObject,
    });
    // TODO: add support for multiple content types, for now prefer JSON
    const content =
      contents.find((content) => content.type === 'json') || contents[0];

    if (content) {
      irOperation.responses[name] = {
        mediaType: content.mediaType,
        schema: schemaToIrSchema({
          context,
          schema: {
            description: responseObject.description,
            ...contentToSchema({ content }),
          },
          state: undefined,
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
    const securitySchemeObjects: Map<string, IR.SecurityObject> = new Map();

    for (const securityRequirementObject of operation.security) {
      for (const name in securityRequirementObject) {
        const securitySchemeObject = securitySchemesMap.get(name);

        if (!securitySchemeObject) {
          continue;
        }

        let irSecuritySchemeObject: IR.SecurityObject | undefined;

        if (securitySchemeObject.type === 'apiKey') {
          irSecuritySchemeObject = securitySchemeObject;
        }

        if (securitySchemeObject.type === 'basic') {
          irSecuritySchemeObject = {
            description: securitySchemeObject.description,
            scheme: 'basic',
            type: 'http',
          };
        }

        if (securitySchemeObject.type === 'oauth2') {
          irSecuritySchemeObject = {
            description: securitySchemeObject.description,
            flows: {},
            type: 'oauth2',
          };

          switch (securitySchemeObject.flow) {
            case 'accessCode':
              irSecuritySchemeObject.flows.authorizationCode = {
                authorizationUrl: securitySchemeObject.authorizationUrl!,
                scopes: securitySchemeObject.scopes,
                tokenUrl: securitySchemeObject.tokenUrl!,
              };
              break;
            case 'application':
              irSecuritySchemeObject.flows.clientCredentials = {
                scopes: securitySchemeObject.scopes,
                tokenUrl: securitySchemeObject.tokenUrl!,
              };
              break;
            case 'implicit':
              irSecuritySchemeObject.flows.implicit = {
                authorizationUrl: securitySchemeObject.authorizationUrl!,
                scopes: securitySchemeObject.scopes,
              };
              break;
            case 'password':
              irSecuritySchemeObject.flows.password = {
                scopes: securitySchemeObject.scopes,
                tokenUrl: securitySchemeObject.tokenUrl!,
              };
              break;
          }
        }

        if (!irSecuritySchemeObject) {
          continue;
        }

        securitySchemeObjects.set(name, irSecuritySchemeObject);
      }
    }

    if (securitySchemeObjects.size) {
      irOperation.security = Array.from(securitySchemeObjects.values());
    }
  }

  // TODO: parser - handle servers
  // qux: operation.servers

  return irOperation;
};

export const parsePathOperation = ({
  context,
  method,
  operation,
  path,
  securitySchemesMap,
  state,
}: {
  context: IR.Context;
  method: Extract<
    keyof PathItemObject,
    'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put' | 'trace'
  >;
  operation: Operation;
  path: keyof IR.PathsObject;
  securitySchemesMap: Map<string, SecuritySchemeObject>;
  state: State;
}) => {
  if (!context.ir.paths) {
    context.ir.paths = {};
  }

  if (!context.ir.paths[path]) {
    context.ir.paths[path] = {};
  }

  context.ir.paths[path][method] = operationToIrOperation({
    context,
    method,
    operation,
    path,
    securitySchemesMap,
    state,
  });
};
