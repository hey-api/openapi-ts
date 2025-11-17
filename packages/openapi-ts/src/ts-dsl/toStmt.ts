import ts from 'typescript';

export const toStmt = (value: ts.Expression | ts.Statement): ts.Statement =>
  ts.isExpression(value) ? ts.factory.createExpressionStatement(value) : value;
