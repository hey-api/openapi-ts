import type { Model } from '../../../client/interfaces/Model';
import type { OperationResponse } from '../../../client/interfaces/OperationResponse';

const areEqual = (a: Model, b: Model): boolean => {
    const equal = a.type === b.type && a.base === b.base && a.template === b.template;
    if (equal && a.link && b.link) {
        return areEqual(a.link, b.link);
    }
    return equal;
};

export const getOperationResults = (operationResponses: OperationResponse[]): OperationResponse[] => {
    const operationResults: OperationResponse[] = [];

    // Filter out success response codes
    operationResponses.forEach(operationResponse => {
        const { code } = operationResponse;
        if (code && code >= 200 && code < 300) {
            operationResults.push(operationResponse);
        }
    });

    return operationResults.filter((operationResult, index, arr) => {
        return (
            arr.findIndex(item => {
                return areEqual(item, operationResult);
            }) === index
        );
    });
};
