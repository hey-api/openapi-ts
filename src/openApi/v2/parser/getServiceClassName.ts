import camelCase from 'camelcase';

/**
 * Convert the input value to a correct service classname. This converts
 * the input string to PascalCase.
 */
export function getServiceClassName(value: string): string {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase(clean, { pascalCase: true });
}
