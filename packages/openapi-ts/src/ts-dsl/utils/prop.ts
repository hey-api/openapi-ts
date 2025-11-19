import ts from 'typescript';

import { numberRegExp, validTypescriptIdentifierRegExp } from '~/utils/regexp';

import { IdTsDsl } from '../expr/id';
import { LiteralTsDsl } from '../expr/literal';

export const safeMemberName = (name: string): ts.PropertyName => {
  validTypescriptIdentifierRegExp.lastIndex = 0;
  if (validTypescriptIdentifierRegExp.test(name)) {
    return new IdTsDsl(name).$render();
  }
  return new LiteralTsDsl(name).$render() as ts.StringLiteral;
};

export const safePropName = (name: string): ts.PropertyName => {
  numberRegExp.lastIndex = 0;
  if (numberRegExp.test(name)) {
    return name.startsWith('-')
      ? (new LiteralTsDsl(name).$render() as ts.StringLiteral)
      : ts.factory.createNumericLiteral(name);
  }

  validTypescriptIdentifierRegExp.lastIndex = 0;
  if (validTypescriptIdentifierRegExp.test(name)) {
    return new IdTsDsl(name).$render();
  }

  return new LiteralTsDsl(name).$render() as ts.StringLiteral;
};
