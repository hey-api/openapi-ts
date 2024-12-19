import type { Pagination } from './pagination';
import {
  hasParametersObjectRequired,
  parameterWithPagination,
} from './parameter';
import { deduplicateSchema } from './schema';
import type { IR } from './types';
import { addItemsToSchema } from './utils';

export const hasOperationDataRequired = (
  operation: IR.OperationObject,
): boolean => {
  if (hasParametersObjectRequired(operation.parameters)) {
    return true;
  }

  if (operation.body?.required) {
    return true;
  }

  return false;
};

export const operationPagination = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}): Pagination | undefined => {
  if (operation.body?.pagination) {
    if (typeof operation.body.pagination === 'boolean') {
      return {
        in: 'body',
        name: 'body',
        schema: operation.body.schema,
      };
    }

    const schema = operation.body.schema.$ref
      ? context.resolveIrRef<IR.RequestBodyObject | IR.SchemaObject>(
          operation.body.schema.$ref,
        )
      : operation.body.schema;
    const finalSchema = 'schema' in schema ? schema.schema : schema;
    return {
      in: 'body',
      name: operation.body.pagination,
      schema: finalSchema.properties![operation.body.pagination]!,
    };
  }

  return parameterWithPagination(operation.parameters);
};

type StatusGroup = '1XX' | '2XX' | '3XX' | '4XX' | '5XX' | 'default';

export const statusCodeToGroup = ({
  statusCode,
}: {
  statusCode: string;
}): StatusGroup => {
  switch (statusCode) {
    case '1XX':
      return '1XX';
    case '2XX':
      return '2XX';
    case '3XX':
      return '3XX';
    case '4XX':
      return '4XX';
    case '5XX':
      return '5XX';
    case 'default':
      return 'default';
    default:
      return `${statusCode[0]}XX` as StatusGroup;
  }
};

interface OperationResponsesMap {
  /**
   * A deduplicated union of all error types. Unknown types are omitted.
   */
  error?: IR.SchemaObject;
  /**
   * An object containing a map of status codes for each error type.
   */
  errors?: IR.SchemaObject;
  /**
   * A deduplicated union of all response types. Unknown types are omitted.
   */
  response?: IR.SchemaObject;
  /**
   * An object containing a map of status codes for each response type.
   */
  responses?: IR.SchemaObject;
}

export const operationResponsesMap = (
  operation: IR.OperationObject,
): OperationResponsesMap => {
  const result: OperationResponsesMap = {};

  if (!operation.responses) {
    return result;
  }

  const errors: Omit<IR.SchemaObject, 'properties'> &
    Pick<Required<IR.SchemaObject>, 'properties'> = {
    properties: {},
    type: 'object',
  };

  const responses: Omit<IR.SchemaObject, 'properties'> &
    Pick<Required<IR.SchemaObject>, 'properties'> = {
    properties: {},
    type: 'object',
  };

  // store default response to be evaluated last
  let defaultResponse: IR.ResponseObject | undefined;

  for (const name in operation.responses) {
    const response = operation.responses[name]!;

    switch (statusCodeToGroup({ statusCode: name })) {
      case '1XX':
      case '3XX':
        // TODO: parser - handle informational and redirection status codes
        break;
      case '2XX':
        responses.properties[name] = response.schema;
        break;
      case '4XX':
      case '5XX':
        errors.properties[name] = response.schema;
        break;
      case 'default':
        defaultResponse = response;
        break;
    }
  }

  // infer default response type
  if (defaultResponse) {
    let inferred = false;

    // assume default is intended for success if none exists yet
    if (!Object.keys(responses.properties).length) {
      responses.properties.default = defaultResponse.schema;
      inferred = true;
    }

    const description = (
      defaultResponse.schema.description ?? ''
    ).toLocaleLowerCase();
    const $ref = (defaultResponse.schema.$ref ?? '').toLocaleLowerCase();

    // TODO: parser - this could be rewritten using regular expressions
    const successKeywords = ['success'];
    if (
      successKeywords.some(
        (keyword) => description.includes(keyword) || $ref.includes(keyword),
      )
    ) {
      responses.properties.default = defaultResponse.schema;
      inferred = true;
    }

    // TODO: parser - this could be rewritten using regular expressions
    const errorKeywords = ['error', 'problem'];
    if (
      errorKeywords.some(
        (keyword) => description.includes(keyword) || $ref.includes(keyword),
      )
    ) {
      errors.properties.default = defaultResponse.schema;
      inferred = true;
    }

    // if no keyword match, assume default schema is intended for error
    if (!inferred) {
      errors.properties.default = defaultResponse.schema;
    }
  }

  const errorKeys = Object.keys(errors.properties);
  if (errorKeys.length) {
    errors.required = errorKeys;
    result.errors = errors;

    let errorUnion = addItemsToSchema({
      items: Object.values(errors.properties),
      mutateSchemaOneItem: true,
      schema: {},
    });
    errorUnion = deduplicateSchema({ schema: errorUnion });
    if (Object.keys(errorUnion).length && errorUnion.type !== 'unknown') {
      result.error = errorUnion;
    }
  }

  const responseKeys = Object.keys(responses.properties);
  if (responseKeys.length) {
    responses.required = responseKeys;
    result.responses = responses;

    let responseUnion = addItemsToSchema({
      items: Object.values(responses.properties),
      mutateSchemaOneItem: true,
      schema: {},
    });
    responseUnion = deduplicateSchema({ schema: responseUnion });
    if (Object.keys(responseUnion).length && responseUnion.type !== 'unknown') {
      result.response = responseUnion;
    }
  }

  return result;
};
