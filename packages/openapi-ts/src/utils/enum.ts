import type { Enum } from '../openApi';
import { unescapeName } from './escapeName';
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
export const enumKey = (value?: string | number, key?: string) => {
    // key will be defined if x-enum-varname exists
    if (key) {
        return key;
    }
    // prefix numbers with underscore
    if (typeof value === 'number') {
        return `'_${value}'`;
    }

    key = '';
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

/**
 * Enums can't contain hyphens in their name. Additionally, name might've been
 * already escaped, so we need to remove quotes around it.
 * {@link https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1969}
 */
export const enumName = (name?: string) => {
    if (!name) {
        return name;
    }
    const escapedName = unescapeName(name).replace(/-([a-z])/gi, ($0, $1: string) => $1.toLocaleUpperCase());
    return `${escapedName.charAt(0).toLocaleUpperCase()}${escapedName.slice(1)}Enum`;
};

export const enumUnionType = (enums: Enum[]) =>
    enums
        .map(enumerator => enumValue(enumerator.value))
        .filter(unique)
        .join(' | ');

export const enumValue = (value?: string | number) => {
    if (typeof value === 'number') {
        return String(value);
    }
    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "\\'")}'`;
    }
    return value;
};
