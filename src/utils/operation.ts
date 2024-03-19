import camelCase from 'camelcase';

import type { UserConfig } from '../node';
import sanitizeOperationName from './sanitizeOperationName';

/**
 * Convert the input value to a correct operation (method) classname.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const getOperationName = (
    url: string,
    method: string,
    options: Pick<Required<UserConfig>, 'operationId'>,
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
