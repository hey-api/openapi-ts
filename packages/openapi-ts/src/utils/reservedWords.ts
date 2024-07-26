/**
 * Matches characters from the start as long as they're not allowed.
 */
export const illegalStartCharactersRegExp = /^[^$_\p{ID_Start}]+/u;

/**
 * Matches the whole value if it's one of the reserved words.
 */
export const reservedWordsRegExp =
  /^(arguments|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/g;
