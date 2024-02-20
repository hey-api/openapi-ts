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
const sanitizeEnumName = (name: string) =>
    name
        .replace(/[^$\u200c\u200d\p{ID_Continue}]/gu, '_')
        .replace(/^([^$_\p{ID_Start}])/u, '_$1')
        .replace(/(\p{Lowercase})(\p{Uppercase}+)/gu, '$1_$2')
        .toUpperCase();

export default sanitizeEnumName;
