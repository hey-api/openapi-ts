import type { OperationError, OperationResponse } from '../../../types/client';

/**
 *
 * @param operationResponses
 */
export const getOperationErrors = (operationResponses: OperationResponse[]): OperationError[] =>
    operationResponses
        .filter(operationResponse => operationResponse.code >= 300 && operationResponse.description)
        .map(response => ({
            code: response.code,
            description: response.description!,
        }));
