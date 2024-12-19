import type { Client } from '../../../types/client';
import { getConfig } from '../../../utils/config';
import type {
  Operation,
  OperationParameter,
  OperationParameters,
} from '../../common/interfaces/client';
import { getRef } from '../../common/parser/getRef';
import {
  getOperationResponseHeader,
  operationNameFn,
} from '../../common/parser/operation';
import { toSortedByRequired } from '../../common/parser/sort';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import type { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import { getOperationParameters } from './getOperationParameters';
import { getOperationRequestBody } from './getOperationRequestBody';
import { getOperationResponses } from './getOperationResponses';

// add global path parameters, skip duplicate names
const mergeParameters = (
  opParams: OperationParameter[],
  globalParams: OperationParameter[],
): OperationParameter[] => {
  let mergedParameters = [...opParams];
  let pendingParameters = [...globalParams];
  while (pendingParameters.length > 0) {
    const pendingParam = pendingParameters[0]!;
    pendingParameters = pendingParameters.slice(1);
    const canMerge = mergedParameters.every(
      (param) =>
        param.in !== pendingParam.in || param.name !== pendingParam.name,
    );
    if (canMerge) {
      mergedParameters = [...mergedParameters, pendingParam];
    }
  }
  return mergedParameters;
};

export const getOperation = ({
  debug,
  method,
  op,
  openApi,
  pathParams,
  types,
  url,
}: {
  debug?: boolean;
  method: Lowercase<Operation['method']>;
  op: OpenApiOperation;
  openApi: OpenApi;
  pathParams: OperationParameters;
  types: Client['types'];
  url: string;
}): Operation => {
  const operationWithoutName: Omit<Operation, 'name'> = {
    $refs: [],
    deprecated: Boolean(op.deprecated),
    description: op.description || null,
    id: op.operationId || null,
    imports: [],
    method: method.toUpperCase() as Operation['method'],
    parameters: [],
    parametersBody: pathParams.parametersBody,
    parametersCookie: [],
    parametersForm: [],
    parametersHeader: [],
    parametersPath: [],
    parametersQuery: [],
    path: url,
    responseHeader: null,
    responses: [],
    summary: op.summary || null,
    tags: op.tags || null,
  };
  const operation = {
    ...operationWithoutName,
    name: operationNameFn({
      config: getConfig(),
      method: operationWithoutName.method,
      operationId: op.operationId,
      path: operationWithoutName.path,
    }),
  };

  if (op.parameters) {
    const parameters = getOperationParameters({
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

  if (op.requestBody) {
    const requestBodyDef = getRef<OpenApiRequestBody>(openApi, op.requestBody);
    const requestBody = getOperationRequestBody({
      body: requestBodyDef,
      debug,
      openApi,
      types,
    });
    operation.$refs = [...operation.$refs, ...requestBody.$refs];
    operation.imports = [...operation.imports, ...requestBody.imports];
    operation.parameters = [...operation.parameters, requestBody];
    operation.parametersBody = requestBody;
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

  operation.parameters = mergeParameters(
    operation.parameters,
    pathParams.parameters,
  );
  operation.parametersCookie = mergeParameters(
    operation.parametersCookie,
    pathParams.parametersCookie,
  );
  operation.parametersForm = mergeParameters(
    operation.parametersForm,
    pathParams.parametersForm,
  );
  operation.parametersHeader = mergeParameters(
    operation.parametersHeader,
    pathParams.parametersHeader,
  );
  operation.parametersPath = mergeParameters(
    operation.parametersPath,
    pathParams.parametersPath,
  );
  operation.parametersQuery = mergeParameters(
    operation.parametersQuery,
    pathParams.parametersQuery,
  );

  operation.parameters = toSortedByRequired(operation.parameters);

  return operation;
};
