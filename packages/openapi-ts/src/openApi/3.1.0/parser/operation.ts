import type { IRContext } from '../../../ir/context';
import type { IROperationObject, IRPathsObject } from '../../../ir/ir';
import type {
  OperationObject,
  PathItemObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from '../types/spec';
import { mediaTypeObject } from './mediaType';
import { paginationField } from './pagination';
import { schemaToIrSchema } from './schema';

interface Operation
  extends Omit<OperationObject, 'parameters'>,
    Pick<IROperationObject, 'id' | 'parameters'> {}

const parseOperationJsDoc = ({
  irOperation,
  operation,
}: {
  irOperation: IROperationObject;
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

  if (operation.tags && operation.tags.length) {
    irOperation.tags = operation.tags;
  }
};

const initIrOperation = ({
  operation,
}: {
  operation: Operation;
}): IROperationObject => {
  const irOperation: IROperationObject = {
    id: operation.id,
  };

  parseOperationJsDoc({
    irOperation,
    operation,
  });

  return irOperation;
};

const operationToIrOperation = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: Operation;
}): IROperationObject => {
  const irOperation = initIrOperation({ operation });

  if (operation.parameters) {
    irOperation.parameters = operation.parameters;
  }

  if (operation.requestBody) {
    const requestBodyObject =
      '$ref' in operation.requestBody
        ? context.resolveRef<RequestBodyObject>(operation.requestBody.$ref)
        : operation.requestBody;
    const content = mediaTypeObject({
      content: requestBodyObject.content,
    });
    if (content) {
      const finalSchema: SchemaObject = {
        description: requestBodyObject.description,
        ...content.schema,
      };

      const pagination = paginationField({
        context,
        name: '',
        schema: finalSchema,
      });

      irOperation.body = {
        mediaType: content.mediaType,
        schema: schemaToIrSchema({
          context,
          schema: finalSchema,
        }),
      };

      if (pagination) {
        irOperation.body.pagination = pagination;
      }

      if (requestBodyObject.required) {
        irOperation.body.required = requestBodyObject.required;
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
        schema: schemaToIrSchema({
          context,
          schema: {
            description: responseObject.description,
            ...content.schema,
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

  // TODO: parser - handle security
  // baz: operation.security

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
}: {
  context: IRContext;
  method: Extract<
    keyof PathItemObject,
    'delete' | 'get' | 'head' | 'options' | 'patch' | 'post' | 'put' | 'trace'
  >;
  operation: Operation;
  operationIds: Map<string, string>;
  path: keyof IRPathsObject;
}) => {
  const operationKey = `${method.toUpperCase()} ${path}`;

  // TODO: parser - move services to plugin, cleaner syntax
  if (
    !context.parserConfig.filterFn.operation({
      config: context.config,
      operationKey,
    })
  ) {
    return;
  }

  // TODO: parser - support throw on duplicate
  if (operation.operationId) {
    if (operationIds.has(operation.operationId)) {
      console.warn(
        `❗️ Duplicate operationId: ${operation.operationId} in ${operationKey}. Please ensure your operation IDs are unique. This behavior is not supported and will likely lead to unexpected results.`,
      );
    } else {
      operationIds.set(operation.operationId, operationKey);
    }
  }

  if (!context.ir.paths) {
    context.ir.paths = {};
  }

  if (!context.ir.paths[path]) {
    context.ir.paths[path] = {};
  }

  operation.id = context.parserConfig.nameFn.operation({
    config: context.config,
    method,
    operationId: operation.operationId,
    path,
  });

  context.ir.paths[path][method] = operationToIrOperation({
    context,
    operation,
  });
};
