import camelCase from 'camelcase';

import { sanitizeNamespaceIdentifier } from './sanitize';

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
export function getServiceVersion(version = '1.0'): string {
    return String(version).replace(/^v/gi, '');
}

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
export const getServiceName = (value: string): string => {
    const clean = sanitizeNamespaceIdentifier(value).trim();
    return camelCase(clean, { pascalCase: true });
};
