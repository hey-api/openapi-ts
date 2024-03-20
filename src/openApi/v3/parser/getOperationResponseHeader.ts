import type { OperationResponse } from '../../../types/client';

export const getOperationResponseHeader = (operationResponses: OperationResponse[]): string | null => {
    const header = operationResponses.find(operationResponses => operationResponses.in === 'header');
    if (header) {
        return header.name;
    }
    return null;
};
