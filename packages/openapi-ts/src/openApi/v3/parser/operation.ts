import type { Client } from '../../../types/client';
import { getOperationResults } from '../../../utils/operation';
import type {
  Operation,
  OperationParameter,
  OperationParameters,
} from '../../common/interfaces/client';
import { getRef } from '../../common/parser/getRef';
import {
  getOperationErrors,
  getOperationName,
  getOperationResponseHeader,
} from '../../common/parser/operation';
import { getServiceName } from '../../common/parser/service';
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
    const pendingParam = pendingParameters[0];
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
  method,
  op,
  openApi,
  pathParams,
  tag,
  types,
  url,
}: {
  method: Lowercase<Operation['method']>;
  op: OpenApiOperation;
  openApi: OpenApi;
  pathParams: OperationParameters;
  tag: string;
  types: Client['types'];
  url: string;
}): Operation => {
  const service = getServiceName(tag);
  const name = getOperationName(url, method, op.operationId);

  const operation: Operation = {
    $refs: [],
    deprecated: Boolean(op.deprecated),
    description: op.description || null,
    errors: [],
    imports: [],
    method: method.toUpperCase() as Operation['method'],
    name,
    parameters: [],
    parametersBody: pathParams.parametersBody,
    parametersCookie: [],
    parametersForm: [],
    parametersHeader: [],
    parametersPath: [],
    parametersQuery: [],
    path: url,
    responseHeader: null,
    results: [],
    service,
    summary: op.summary || null,
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
      openApi,
      types,
    });
    operation.$refs = [...operation.$refs, ...requestBody.$refs];
    operation.imports = [...operation.imports, ...requestBody.imports];
    operation.parameters = [...operation.parameters, requestBody];
    operation.parametersBody = requestBody;
  }

  if (op.responses) {
    const operationResponses = getOperationResponses({
      openApi,
      responses: op.responses,
      types,
    });
    const operationResults = getOperationResults(operationResponses);
    operation.errors = getOperationErrors(operationResponses);
    operation.responseHeader = getOperationResponseHeader(operationResults);

    operationResults.forEach((operationResult) => {
      operation.$refs = [...operation.$refs, ...operationResult.$refs];
      operation.imports = [...operation.imports, ...operationResult.imports];
      operation.results = [...operation.results, operationResult];
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

  // Sort by required
  operation.parameters = toSortedByRequired(operation.parameters);

  return operation;
};
