import type ts from 'typescript';

import type { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';
import { LiteralTsDsl } from '../expr/literal';
import { regexp } from './regexp';
import {
  browserGlobals,
  javaScriptGlobals,
  javaScriptKeywords,
  nodeGlobals,
  typeScriptKeywords,
} from './reserved';

export const safeMemberName = (name: string): TsDsl<ts.PropertyName> => {
  regexp.typeScriptIdentifier.lastIndex = 0;
  if (regexp.typeScriptIdentifier.test(name)) {
    return new IdTsDsl(name);
  }
  return new LiteralTsDsl(name) as TsDsl<ts.PropertyName>;
};

export const safePropName = (name: string): TsDsl<ts.PropertyName> => {
  regexp.number.lastIndex = 0;
  if (regexp.number.test(name)) {
    return name.startsWith('-')
      ? (new LiteralTsDsl(name) as TsDsl<ts.PropertyName>)
      : (new LiteralTsDsl(Number(name)) as TsDsl<ts.PropertyName>);
  }

  regexp.typeScriptIdentifier.lastIndex = 0;
  if (regexp.typeScriptIdentifier.test(name)) {
    return new IdTsDsl(name);
  }

  return new LiteralTsDsl(name) as TsDsl<ts.PropertyName>;
};

const sanitizeName = (name: string, reserved: Set<string>): string => {
  let sanitized = '';
  let index: number;

  const first = name[0]!;
  regexp.illegalStartCharacters.lastIndex = 0;
  if (regexp.illegalStartCharacters.test(first)) {
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

  if (reserved.has(sanitized)) {
    sanitized = `_${sanitized}`;
  }

  return sanitized || '_';
};

const runtimeReserved = new Set([
  ...browserGlobals,
  ...javaScriptGlobals,
  ...javaScriptKeywords,
  ...nodeGlobals,
  ...typeScriptKeywords,
]);

const typeReserved = new Set([...javaScriptKeywords, ...typeScriptKeywords]);

export const safeRuntimeName = (name: string) =>
  sanitizeName(name, runtimeReserved);
export const safeTypeName = (name: string) => sanitizeName(name, typeReserved);
