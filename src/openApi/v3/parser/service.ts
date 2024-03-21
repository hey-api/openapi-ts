import camelCase from 'camelcase';

import { sanitizeServiceName } from '../../../utils/sanitize';

export const allowedServiceMethods = ['delete', 'get', 'head', 'options', 'patch', 'post', 'put'] as const;

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
export const getServiceName = (value: string): string => {
    const clean = sanitizeServiceName(value).trim();
    return camelCase(clean, { pascalCase: true });
};
