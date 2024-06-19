import type { Client } from '../../../types/client';
import type {
  Operation,
  OperationParameters,
} from '../../common/interfaces/client';
import {
  getErrorResponses,
  getOperationName,
  getOperationResponseHeader,
  getSuccessResponses,
} from '../../common/parser/operation';
import { getServiceName } from '../../common/parser/service';
import { toSortedByRequired } from '../../common/parser/sort';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getOperationParameters } from './getOperationParameters';
import { getOperationResponses } from './getOperationResponses';

export const getOperation = ({
  method,
  op,
  openApi,
  pathParams,
  tag,
  types,
  url,
}: {
  openApi: OpenApi;
  url: string;
  method: Lowercase<Operation['method']>;
  tag: string;
  op: OpenApiOperation;
  pathParams: OperationParameters;
  types: Client['types'];
}): Operation => {
  const serviceName = getServiceName(tag);
  const name = getOperationName(url, method, op.operationId);

  // Create a new operation object for this method.
  const operation: Operation = {
    $refs: [],
    deprecated: op.deprecated === true,
    description: op.description || null,
    errors: [],
    id: op.operationId || null,
    imports: [],
    method: method.toUpperCase() as Operation['method'],
    name,
    parameters: [...pathParams.parameters],
    parametersBody: pathParams.parametersBody,
    parametersCookie: [...pathParams.parametersCookie],
    parametersForm: [...pathParams.parametersForm],
    parametersHeader: [...pathParams.parametersHeader],
    parametersPath: [...pathParams.parametersPath],
    parametersQuery: [...pathParams.parametersQuery],
    path: url,
    responseHeader: null,
    results: [],
    service: serviceName,
    summary: op.summary || null,
  };

  // Parse the operation parameters (path, query, body, etc).
  if (op.parameters) {
    const parameters = getOperationParameters({
      openApi,
      parameters: op.parameters,
      types,
    });
    operation.imports = [...operation.imports, ...parameters.imports];
    operation.parameters = [...operation.parameters, ...parameters.parameters];
    operation.parametersPath = [
      ...operation.parametersPath,
      ...parameters.parametersPath,
    ];
    operation.parametersQuery = [
      ...operation.parametersQuery,
      ...parameters.parametersQuery,
    ];
    operation.parametersForm = [
      ...operation.parametersForm,
      ...parameters.parametersForm,
    ];
    operation.parametersHeader = [
      ...operation.parametersHeader,
      ...parameters.parametersHeader,
    ];
    operation.parametersCookie = [
      ...operation.parametersCookie,
      ...parameters.parametersCookie,
    ];
    operation.parametersBody = parameters.parametersBody;
  }

  // Parse the operation responses.
  if (op.responses) {
    const operationResponses = getOperationResponses({
      openApi,
      responses: op.responses,
      types,
    });
    operation.errors = getErrorResponses(operationResponses);

    const successResponses = getSuccessResponses(operationResponses);
    operation.responseHeader = getOperationResponseHeader(successResponses);

    successResponses.forEach((operationResult) => {
      operation.results = [...operation.results, operationResult];
      operation.imports = [...operation.imports, ...operationResult.imports];
    });
  }

  operation.parameters = toSortedByRequired(operation.parameters);

  return operation;
};
