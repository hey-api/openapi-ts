import type { Client } from '../../../../types/client';
import type {
  Operation,
  OperationParameters,
} from '../../common/interfaces/client';
import { Config } from '../../common/interfaces/config';
import { getOperationResponseHeader } from '../../common/parser/operation';
import { toSortedByRequired } from '../../common/parser/sort';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getOperationParameters } from './getOperationParameters';
import { getOperationResponses } from './getOperationResponses';

export const getOperation = ({
  method,
  op,
  openApi,
  types,
  pathParams,
  url,
  config,
}: {
  config: Config;
  method: Lowercase<Operation['method']>;
  op: OpenApiOperation;
  openApi: OpenApi;
  pathParams: OperationParameters;
  types: Client['types'];
  url: string;
}): Operation => {
  const operationWithoutName: Omit<Operation, 'name'> = {
    $refs: [],
    deprecated: op.deprecated === true,
    description: op.description || null,
    id: op.operationId || null,
    imports: [],
    method: method.toUpperCase() as Operation['method'],
    parameters: [...pathParams.parameters],
    parametersBody: pathParams.parametersBody,
    parametersCookie: [...pathParams.parametersCookie],
    parametersForm: [...pathParams.parametersForm],
    parametersHeader: [...pathParams.parametersHeader],
    parametersPath: [...pathParams.parametersPath],
    parametersQuery: [...pathParams.parametersQuery],
    path: url,
    responseHeader: null,
    responses: [],
    summary: op.summary || null,
    tags: op.tags || [],
  };
  const operation: Operation = {
    ...operationWithoutName,
    name: config.nameFn.operation(operationWithoutName),
  };

  if (op.parameters) {
    const parameters = getOperationParameters({
      config,
      openApi,
      parameters: op.parameters,
      types,
    });
    operation.$refs = [...operation.$refs, ...parameters.$refs];
    operation.imports = [...operation.imports, ...parameters.imports];
    operation.parameters = [...operation.parameters, ...parameters.parameters];
    operation.parametersBody = parameters.parametersBody;
    operation.parametersCookie = [
      ...operation.parametersCookie,
      ...parameters.parametersCookie,
    ];
    operation.parametersForm = [
      ...operation.parametersForm,
      ...parameters.parametersForm,
    ];
    operation.parametersHeader = [
      ...operation.parametersHeader,
      ...parameters.parametersHeader,
    ];
    operation.parametersPath = [
      ...operation.parametersPath,
      ...parameters.parametersPath,
    ];
    operation.parametersQuery = [
      ...operation.parametersQuery,
      ...parameters.parametersQuery,
    ];
  }

  if (op.responses) {
    operation.responses = getOperationResponses({
      openApi,
      responses: op.responses,
      types,
    });
    const successResponses = operation.responses.filter((response) =>
      response.responseTypes.includes('success'),
    );

    operation.responseHeader = getOperationResponseHeader(successResponses);

    successResponses.forEach((response) => {
      operation.$refs = [...operation.$refs, ...response.$refs];
      operation.imports = [...operation.imports, ...response.imports];
    });
  }

  operation.parameters = toSortedByRequired(operation.parameters);

  return operation;
};
