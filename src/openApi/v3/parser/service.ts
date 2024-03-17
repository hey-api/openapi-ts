import camelCase from 'camelcase';

import sanitizeServiceName from '../../../utils/sanitizeServiceName';

export const allowedServiceMethods = ['delete', 'get', 'head', 'options', 'patch', 'post', 'put'] as const;

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
export const getServiceName = (value: string): string => {
    const clean = sanitizeServiceName(value).trim();
    return camelCase(clean, { pascalCase: true });
};

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
export const getServiceVersion = (version = '1.0'): string => String(version).replace(/^v/gi, '');
