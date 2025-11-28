import type ts from 'typescript';

import type { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';
import { LiteralTsDsl } from '../expr/literal';
import {
  illegalStartCharactersRegExp,
  numberRegExp,
  reservedBrowserGlobalsRegExp,
  reservedJavaScriptGlobalsRegExp,
  reservedJavaScriptKeywordsRegExp,
  reservedNodeGlobalsRegExp,
  reservedTypeScriptKeywordsRegExp,
  validTypescriptIdentifierRegExp,
} from './regexp';

export const safeMemberName = (name: string): TsDsl<ts.PropertyName> => {
  validTypescriptIdentifierRegExp.lastIndex = 0;
  if (validTypescriptIdentifierRegExp.test(name)) {
    return new IdTsDsl(name);
  }
  return new LiteralTsDsl(name) as TsDsl<ts.PropertyName>;
};

export const safePropName = (name: string): TsDsl<ts.PropertyName> => {
  numberRegExp.lastIndex = 0;
  if (numberRegExp.test(name)) {
    return name.startsWith('-')
      ? (new LiteralTsDsl(name) as TsDsl<ts.PropertyName>)
      : (new LiteralTsDsl(Number(name)) as TsDsl<ts.PropertyName>);
  }

  validTypescriptIdentifierRegExp.lastIndex = 0;
  if (validTypescriptIdentifierRegExp.test(name)) {
    return new IdTsDsl(name);
  }

  return new LiteralTsDsl(name) as TsDsl<ts.PropertyName>;
};

const regexps = [
  reservedJavaScriptKeywordsRegExp,
  reservedTypeScriptKeywordsRegExp,
  reservedJavaScriptGlobalsRegExp,
  reservedNodeGlobalsRegExp,
  reservedBrowserGlobalsRegExp,
];

export const safeSymbolName = (name: string): string => {
  let sanitized = '';
  let index: number;

  const first = name[0]!;
  illegalStartCharactersRegExp.lastIndex = 0;
  if (illegalStartCharactersRegExp.test(first)) {
    sanitized += '_';
    index = 0;
  } else {
    sanitized += first;
    index = 1;
  }

  while (index < name.length) {
    const char = name[index]!;
    sanitized += /^[\u200c\u200d\p{ID_Continue}]$/u.test(char) ? char : '_';
    index += 1;
  }

  for (const regexp of regexps) {
    sanitized = sanitized.replace(regexp, '_$1');
  }

  return sanitized || '_';
};
