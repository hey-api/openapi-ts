import camelCase from 'camelcase';

import { reservedWords } from '../../../utils/reservedWords';
import sanitizeOperationParameterName from '../../../utils/sanitizeOperationParameterName';

/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
export const getOperationParameterName = (value: string): string => {
    const clean = sanitizeOperationParameterName(value).trim();
    return camelCase(clean).replace(reservedWords, '_$1');
};
