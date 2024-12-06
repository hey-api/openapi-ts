import {
  illegalStartCharactersRegExp,
  reservedBrowserGlobalsRegExp,
  reservedJavaScriptGlobalsRegExp,
  reservedJavaScriptKeywordsRegExp,
  reservedNodeGlobalsRegExp,
  reservedTypeScriptKeywordsRegExp,
} from '../../../utils/regexp';

const regexps = [
  reservedJavaScriptKeywordsRegExp,
  reservedTypeScriptKeywordsRegExp,
  reservedJavaScriptGlobalsRegExp,
  reservedNodeGlobalsRegExp,
  reservedBrowserGlobalsRegExp,
];

export const ensureValidIdentifier = (name: string): string => {
  let identifier = name.replace(/[^$\u200c\u200d\p{ID_Continue}]/gu, '_');

  illegalStartCharactersRegExp.lastIndex = 0;
  if (illegalStartCharactersRegExp.test(identifier)) {
    return `_${identifier}`;
  }

  for (const regexp of regexps) {
    if (identifier.startsWith('_')) {
      return identifier;
    }

    identifier = identifier.replace(regexp, '_$1');
  }

  return identifier;
};
