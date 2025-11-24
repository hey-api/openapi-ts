import type ts from 'typescript';

import { numberRegExp, validTypescriptIdentifierRegExp } from '~/utils/regexp';

import type { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';
import { LiteralTsDsl } from '../expr/literal';

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
