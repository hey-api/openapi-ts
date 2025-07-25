import ts from 'typescript';

export const expressionToStatement = ({
  expression,
}: {
  expression: ts.Expression;
}) => {
  const statement = ts.factory.createExpressionStatement(expression);
  return statement;
};
