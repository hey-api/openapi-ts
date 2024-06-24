import ts from 'typescript';

import { isType } from './utils';

/**
 * Create a return function call statement.
 * Example `return fn<string>(params)`.
 * @param args arguments to pass to the function.
 * @param name name of the function to call.
 * @param types list of function types
 * @returns ts.ReturnStatement
 */
export const createReturnFunctionCall = ({
  args = [],
  name,
  types = [],
}: {
  args: any[];
  name: string;
  types?: string[];
}) => {
  const expression = ts.factory.createCallExpression(
    ts.factory.createIdentifier(name),
    types.map((type) => ts.factory.createTypeReferenceNode(type)),
    args
      .map((arg) =>
        ts.isExpression(arg) ? arg : ts.factory.createIdentifier(arg),
      )
      .filter(isType<ts.Identifier | ts.Expression>),
  );
  const statement = createReturnStatement({ expression });
  return statement;
};

export const createReturnStatement = ({
  expression,
}: {
  expression?: ts.Expression;
}) => ts.factory.createReturnStatement(expression);
