import type { Config } from '../../../types/config';
import type { Operation, OperationParameters } from '../../common/interfaces/client';
import { getOperationErrors, getOperationName, getOperationResponseHeader } from '../../common/parser/operation';
import { getServiceName } from '../../common/parser/service';
import { toSortedByRequired } from '../../common/parser/sort';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getOperationParameters } from './getOperationParameters';
import { getOperationResponses } from './getOperationResponses';
import { getOperationResults } from './getOperationResults';

export const getOperation = (
    openApi: OpenApi,
    url: string,
    method: Lowercase<Operation['method']>,
    tag: string,
    op: OpenApiOperation,
    pathParams: OperationParameters,
    options: Config
): Operation => {
    const serviceName = getServiceName(tag);
    const name = getOperationName(url, method, options, op.operationId);

    // Create a new operation object for this method.
    const operation: Operation = {
        $refs: [],
        deprecated: op.deprecated === true,
        description: op.description || null,
        errors: [],
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
        const parameters = getOperationParameters(openApi, op.parameters);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersBody = parameters.parametersBody;
    }

    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses(openApi, op.responses);
        const operationResults = getOperationResults(operationResponses);
        operation.errors = getOperationErrors(operationResponses);
        operation.responseHeader = getOperationResponseHeader(operationResults);

        operationResults.forEach(operationResult => {
            operation.results.push(operationResult);
            operation.imports.push(...operationResult.imports);
        });
    }

    operation.parameters = toSortedByRequired(operation.parameters);

    return operation;
};
