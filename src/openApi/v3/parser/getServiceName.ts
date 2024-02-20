import camelCase from 'camelcase';

import sanitizeServiceName from '../../../utils/sanitizeServiceName';

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
export const getServiceName = (value: string): string => {
    const clean = sanitizeServiceName(value).trim();
    return camelCase(clean, { pascalCase: true });
};
