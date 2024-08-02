import ts from 'typescript';

import { createCallExpression } from './module';
import { isType } from './utils';

const createReturnStatement = ({
  expression,
}: {
  expression?: ts.Expression;
}) => ts.factory.createReturnStatement(expression);

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
  const typeArguments = types.map((type) =>
    ts.factory.createTypeReferenceNode(type),
  );
  const argumentsArray = args
    .map((arg) =>
      ts.isExpression(arg) ? arg : ts.factory.createIdentifier(arg),
    )
    .filter(isType<ts.Identifier | ts.Expression>);
  const expression = createCallExpression({
    functionName: name,
    parameters: argumentsArray,
    types: typeArguments,
  });
  const statement = createReturnStatement({ expression });
  return statement;
};

export const createReturnVariable = ({ name }: { name: string }) =>
  createReturnStatement({
    expression: ts.factory.createIdentifier(name),
  });
