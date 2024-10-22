import type { IROperationObject, IRResponseObject, IRSchemaObject } from './ir';
import type { Pagination } from './pagination';
import {
  hasParametersObjectRequired,
  parameterWithPagination,
} from './parameter';
import { deduplicateSchema } from './schema';
import { addItemsToSchema } from './utils';

export const hasOperationDataRequired = (
  operation: IROperationObject,
): boolean => {
  if (hasParametersObjectRequired(operation.parameters)) {
    return true;
  }

  if (operation.body?.required) {
    return true;
  }

  return false;
};

export const operationPagination = (
  operation: IROperationObject,
): Pagination | undefined => {
  if (operation.body?.pagination) {
    return {
      in: 'body',
      name:
        operation.body.pagination === true ? 'body' : operation.body.pagination,
      schema:
        operation.body.pagination === true
          ? operation.body.schema
          : operation.body.schema.properties![operation.body.pagination],
    };
  }

  return parameterWithPagination(operation.parameters);
};

type StatusGroup = '1XX' | '2XX' | '3XX' | '4XX' | '5XX' | 'default';

const statusCodeToGroup = ({
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
  error: IRSchemaObject | undefined;
  response: IRSchemaObject | undefined;
}

export const operationResponsesMap = (
  operation: IROperationObject,
): OperationResponsesMap => {
  const result: OperationResponsesMap = {
    error: undefined,
    response: undefined,
  };

  if (!operation.responses) {
    return result;
  }

  let errors: IRSchemaObject = {};
  const errorsItems: Array<IRSchemaObject> = [];

  let responses: IRSchemaObject = {};
  const responsesItems: Array<IRSchemaObject> = [];

  let defaultResponse: IRResponseObject | undefined;

  for (const name in operation.responses) {
    const response = operation.responses[name]!;

    switch (statusCodeToGroup({ statusCode: name })) {
      case '1XX':
      case '3XX':
        // TODO: parser - handle informational and redirection status codes
        break;
      case '2XX':
        responsesItems.push(response.schema);
        break;
      case '4XX':
      case '5XX':
        errorsItems.push(response.schema);
        break;
      case 'default':
        // store default response to be evaluated last
        defaultResponse = response;
        break;
    }
  }

  // infer default response type
  if (defaultResponse) {
    let inferred = false;

    // assume default is intended for success if none exists yet
    if (!responsesItems.length) {
      responsesItems.push(defaultResponse.schema);
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
      responsesItems.push(defaultResponse.schema);
      inferred = true;
    }

    // TODO: parser - this could be rewritten using regular expressions
    const errorKeywords = ['error', 'problem'];
    if (
      errorKeywords.some(
        (keyword) => description.includes(keyword) || $ref.includes(keyword),
      )
    ) {
      errorsItems.push(defaultResponse.schema);
      inferred = true;
    }

    // if no keyword match, assume default schema is intended for error
    if (!inferred) {
      errorsItems.push(defaultResponse.schema);
    }
  }

  if (errorsItems.length) {
    errors = addItemsToSchema({
      items: errorsItems,
      mutateSchemaOneItem: true,
      schema: errors,
    });
    errors = deduplicateSchema({ schema: errors });
    if (Object.keys(errors).length) {
      result.error = errors;
    }
  }

  if (responsesItems.length) {
    responses = addItemsToSchema({
      items: responsesItems,
      mutateSchemaOneItem: true,
      schema: responses,
    });
    responses = deduplicateSchema({ schema: responses });
    if (Object.keys(responses).length) {
      result.response = responses;
    }
  }

  return result;
};
