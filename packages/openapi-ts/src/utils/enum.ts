import type { Enum } from '../openApi';
import type { Client } from '../types/client';
import { unescapeName } from './escape';
import { unique } from './unique';

/**
 * Sanitizes names of enums, so they are valid typescript identifiers of a certain form.
 *
 * 1: Replace all characters not legal as part of identifier with '_'
 * 2: Add '_' prefix if first character of enum name has character not legal for start of identifier
 * 3: Add '_' where the string transitions from lowercase to uppercase
 * 4: Transform the whole string to uppercase
 *
 * Javascript identifier regexp pattern retrieved from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 */
export const enumKey = (value?: string | number, customName?: string) => {
    if (customName) {
        return customName;
    }
    // prefix numbers with underscore
    if (typeof value === 'number') {
        return `'_${value}'`;
    }

    let key = '';
    if (typeof value === 'string') {
        key = value
            .replace(/[^$\u200c\u200d\p{ID_Continue}]/gu, '_')
            .replace(/^([^$_\p{ID_Start}])/u, '_$1')
            .replace(/(\p{Lowercase})(\p{Uppercase}+)/gu, '$1_$2');
    }
    key = key.trim();
    if (!key) {
        key = 'empty_string';
    }
    return key.toUpperCase();
};

const updateClientEnums = (client: Client, currentEnum: string) => {
    let index = 1;
    let result = currentEnum;
    while (client.enumNames.includes(result)) {
        if (result.endsWith(index.toString())) {
            result = result.slice(0, result.length - index.toString().length);
        }
        index += 1;
        result = result + index.toString();
    }
    client.enumNames = [...client.enumNames, result];
}

/**
 * Enums can't contain hyphens in their name. Additionally, name might've been
 * already escaped, so we need to remove quotes around it.
 * {@link https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1969}
 */
export const javascriptEnumName = (client: Client, name?: string) => {
    if (!name) {
        return name;
    }
    const escapedName = unescapeName(name).replace(/[-_]([a-z])/gi, ($0, $1: string) => $1.toLocaleUpperCase());
    const result = `${escapedName.charAt(0).toLocaleUpperCase() + escapedName.slice(1)}Enum`;
    updateClientEnums(client, result);
    return result;
};

export const javascriptPreservedEnumName = (client: Client, name?: string) => {
    if (!name) {
        return name;
    }

    // Remove all invalid characters
    const cleanEnum = unescapeName(name).replace(/[^a-zA-Z0-9_$]/gi, '');
    updateClientEnums(client, cleanEnum);
    return cleanEnum;
}

export const enumUnionType = (enums: Enum[]) =>
    enums
        .map(enumerator => enumValue(enumerator.value))
        .filter(unique)
        .join(' | ');

export const enumValue = (value?: string | number) => {
    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "\\'")}'`;
    }
    return value;
};
