import camelCase from 'camelcase';

import type { Options } from '../../../client/interfaces/Options';
import sanitizeOperationName from '../../../utils/sanitizeOperationName';

/**
 * Convert the input value to a correct operation (method) classname.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const getOperationName = (url: string, method: string, options: Options, operationId?: string): string => {
    const { useOperationId = true } = options;
    if (useOperationId && operationId) {
        return camelCase(sanitizeOperationName(operationId).trim());
    }

    const urlWithoutPlaceholders = url
        .replace(/[^/]*?{api-version}.*?\//g, '')
        .replace(/{(.*?)}/g, 'by-$1')
        .replace(/\//g, '-');

    return camelCase(`${method}-${urlWithoutPlaceholders}`);
};
