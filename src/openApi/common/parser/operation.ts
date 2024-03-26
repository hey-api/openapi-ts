import camelCase from 'camelcase';

import type { OperationError, OperationResponse } from '../../../types/client';
import type { Config } from '../../../types/config';
import { reservedWords } from './reservedWords';
import { sanitizeOperationName, sanitizeOperationParameterName } from './sanitize';

/**
 * Convert the input value to a correct operation (method) classname.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const getOperationName = (
    url: string,
    method: string,
    options: Pick<Config, 'operationId'>,
    operationId?: string
): string => {
    if (options.operationId && operationId) {
        return camelCase(sanitizeOperationName(operationId).trim());
    }

    const urlWithoutPlaceholders = url
        .replace(/[^/]*?{api-version}.*?\//g, '')
        .replace(/{(.*?)}/g, 'by-$1')
        .replace(/\//g, '-');

    return camelCase(`${method}-${urlWithoutPlaceholders}`);
};

/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
export const getOperationParameterName = (value: string): string => {
    const clean = sanitizeOperationParameterName(value).trim();
    return camelCase(clean).replace(reservedWords, '_$1');
};

export const getOperationResponseHeader = (operationResponses: OperationResponse[]): string | null => {
    const header = operationResponses.find(operationResponses => operationResponses.in === 'header');
    if (header) {
        return header.name;
    }
    return null;
};

export const getOperationResponseCode = (value: string | 'default'): number | null => {
    // You can specify a "default" response, this is treated as HTTP code 200
    if (value === 'default') {
        return 200;
    }

    // Check if we can parse the code and return of successful.
    if (/[0-9]+/g.test(value)) {
        const code = parseInt(value);
        if (Number.isInteger(code)) {
            return Math.abs(code);
        }
    }

    return null;
};

export const getOperationErrors = (operationResponses: OperationResponse[]): OperationError[] =>
    operationResponses
        .filter(operationResponse => operationResponse.code >= 300 && operationResponse.description)
        .map(response => ({
            code: response.code,
            description: response.description!,
        }));
