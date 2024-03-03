import type { Operation } from '../../../client/interfaces/Operation';
import type { OperationParameters } from '../../../client/interfaces/OperationParameters';
import type { Options } from '../../../client/interfaces/Options';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import type { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import { getOperationErrors } from './getOperationErrors';
import { getOperationName } from './getOperationName';
import { getOperationParameters } from './getOperationParameters';
import { getOperationRequestBody } from './getOperationRequestBody';
import { getOperationResponseHeader } from './getOperationResponseHeader';
import { getOperationResponses } from './getOperationResponses';
import { getOperationResults } from './getOperationResults';
import { getRef } from './getRef';
import { getServiceName } from './getServiceName';
import { sortByRequired } from './sortByRequired';

export const getOperation = (
    openApi: OpenApi,
    url: string,
    method: string,
    tag: string,
    op: OpenApiOperation,
    pathParams: OperationParameters,
    options: Options
): Operation => {
    const service = getServiceName(tag);
    const name = getOperationName(url, method, options, op.operationId);

    // Create a new operation object for this method.
    const operation: Operation = {
        deprecated: Boolean(op.deprecated),
        description: op.description || null,
        errors: [],
        imports: [],
        method: method.toUpperCase(),
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
        service,
        summary: op.summary || null,
    };

    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters = getOperationParameters(openApi, op.parameters);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersBody = parameters.parametersBody;
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
    }

    if (op.requestBody) {
        const requestBodyDef = getRef<OpenApiRequestBody>(openApi, op.requestBody);
        const requestBody = getOperationRequestBody(openApi, requestBodyDef);
        operation.imports.push(...requestBody.imports);
        operation.parameters.push(requestBody);
        operation.parametersBody = requestBody;
    }

    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses(openApi, op.responses);
        const operationResults = getOperationResults(operationResponses);
        operation.errors = getOperationErrors(operationResponses);
        operation.responseHeader = getOperationResponseHeader(operationResults);

        operationResults.forEach(operationResult => {
            operation.imports.push(...operationResult.imports);
            operation.results.push(operationResult);
        });
    }

    operation.parameters = operation.parameters.sort(sortByRequired);

    return operation;
};
