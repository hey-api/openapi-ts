import ts from 'typescript';

export const convertExpressionToStatement = ({
  expression,
}: {
  expression: ts.Expression;
}) => {
  const statement = ts.factory.createExpressionStatement(expression);
  return statement;
};
