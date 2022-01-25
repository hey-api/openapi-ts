import camelCase from 'camelcase';

/**
 * Convert the input value to a correct operation (method) classname.
 * This converts the input string to camelCase, so the method name follows
 * the most popular Javascript and Typescript writing style.
 */
export const getOperationName = (value: string): string => {
    const clean = value
        .replace(/^[^a-zA-Z]+/g, '')
        .replace(/[^\w\-]+/g, '-')
        .trim();
    return camelCase(clean);
};
