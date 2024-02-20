/**
 * Sanitizes service names, so they are valid typescript identifiers of a certain form.
 *
 * 1: Remove any leading characters that are illegal as starting character of a typescript identifier.
 * 2: Replace illegal characters in remaining part of type name with underscore (-).
 *
 * Step 1 should perhaps instead also replace illegal characters with underscore, or prefix with it, like sanitizeEnumName
 * does. The way this is now one could perhaps end up removing all characters, if all are illegal start characters. It
 * would be sort of a breaking change to do so, though, previously generated code might change then.
 *
 * Javascript identifier regexp pattern retrieved from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 *
 * The output of this is expected to be converted to PascalCase
 */
const sanitizeServiceName = (name: string) =>
    name.replace(/^[^\p{ID_Start}]+/u, '').replace(/[^$\u200c\u200d\p{ID_Continue}]/gu, '-');

export default sanitizeServiceName;
