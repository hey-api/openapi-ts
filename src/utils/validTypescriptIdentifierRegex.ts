// Javascript identifier regexp pattern retrieved from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
const validTypescriptIdentifierRegex = /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u;

export default validTypescriptIdentifierRegex;
