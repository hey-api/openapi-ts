import ts from 'typescript';

import { numberRegExp, validTypescriptIdentifierRegExp } from '~/utils/regexp';

export const safeMemberName = (name: string): ts.PropertyName => {
  validTypescriptIdentifierRegExp.lastIndex = 0;
  if (validTypescriptIdentifierRegExp.test(name)) {
    return ts.factory.createIdentifier(name);
  }
  return ts.factory.createStringLiteral(name);
};

export const safePropName = (name: string): ts.PropertyName => {
  numberRegExp.lastIndex = 0;
  if (numberRegExp.test(name)) {
    return name.startsWith('-')
      ? ts.factory.createStringLiteral(name)
      : ts.factory.createNumericLiteral(name);
  }

  validTypescriptIdentifierRegExp.lastIndex = 0;
  if (validTypescriptIdentifierRegExp.test(name)) {
    return ts.factory.createIdentifier(name);
  }

  return ts.factory.createStringLiteral(name);
};
