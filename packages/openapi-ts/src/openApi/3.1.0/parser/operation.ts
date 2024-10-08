import type { IRContext } from '../../../ir/context';
import type { IROperationObject, IRPathsObject } from '../../../ir/ir';
import type {
  OperationObject,
  PathItemObject,
  RequestBodyObject,
  ResponseObject,
} from '../types/spec';
import { getMediaTypeSchema } from './mediaType';
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
    const content = getMediaTypeSchema({
      content: requestBodyObject.content,
    });
    if (content) {
      irOperation.body = {
        schema: schemaToIrSchema({
          context,
          schema: {
            description: requestBodyObject.description,
            ...content.schema,
          },
        }),
      };

      if (requestBodyObject.required) {
        irOperation.body.required = requestBodyObject.required;
      }
    }
  }

  for (const name in operation.responses) {
    const response = operation.responses[name]!;
    const responseObject =
      '$ref' in response
        ? context.resolveRef<ResponseObject>(response.$ref)
        : response;
    const content = getMediaTypeSchema({
      content: responseObject.content,
    });
    if (content) {
      if (!irOperation.responses) {
        irOperation.responses = {};
      }

      irOperation.responses[name] = {
        schema: schemaToIrSchema({
          context,
          schema: {
            description: responseObject.description,
            ...content.schema,
          },
        }),
      };
    } else if (name === '204') {
      if (!irOperation.responses) {
        irOperation.responses = {};
      }

      irOperation.responses[name] = {
        schema: {
          description: responseObject.description,
          type: 'void',
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
