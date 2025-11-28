/**
 * Matches characters from the start as long as they're not allowed.
 */
export const illegalStartCharactersRegExp = /^[^$_\p{ID_Start}]+/u;

/**
 * Matches string if it contains only digits and optionally decimal point or
 * leading minus sign.
 */
export const numberRegExp = /^-?\d+(\.\d+)?$/;

export const reservedBrowserGlobalsRegExp =
  /^(document|history|location|navigator|window)$/g;

export const reservedJavaScriptGlobalsRegExp =
  /^(console|Array|Date|Error|Function|JSON|Map|Math|Object|Promise|RegExp|Set|WeakMap|WeakSet)$/g;

export const reservedJavaScriptKeywordsRegExp =
  /^(arguments|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/g;

export const reservedNodeGlobalsRegExp = /^(global|process|Buffer)$/g;

export const reservedTypeScriptKeywordsRegExp =
  /^(any|as|bigint|boolean|namespace|never|null|number|string|symbol|type|undefined|unknown|void)$/g;

/**
 * Javascript identifier regexp pattern retrieved from
 * {@link} https://developer.mozilla.org/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
 */
export const validTypescriptIdentifierRegExp =
  /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u;
