import validTypescriptIdentifierRegex from '../../../utils/validTypescriptIdentifierRegex';

export const escapeName = (value: string): string => {
    if (value || value === '') {
        const validName = validTypescriptIdentifierRegex.test(value);
        if (!validName) {
            return `'${value}'`;
        }
    }
    return value;
};
