import ts from 'typescript';

import { createCallExpression } from './module';
import { createTypeReferenceNode } from './types';
import { createIdentifier, isType } from './utils';

export const createReturnStatement = ({
  expression,
}: {
  expression?: ts.Expression;
}) => ts.factory.createReturnStatement(expression);

/**
 * Create a return function call statement.
 *
 * @example `return fn<string>(params)`
 *
 * @returns ts.ReturnStatement
 */
export const createReturnFunctionCall = ({
  args = [],
  name,
  types = [],
}: {
  /**
   * Arguments to pass to the function.
   */
  args: any[];
  /**
   * Name of the function to call or expression.
   */
  name: string | ts.Expression;
  /**
   * List of function types.
   */
  types?: ReadonlyArray<string | ts.StringLiteral>;
}) => {
  const typeArguments = types.map((type) =>
    // this works with string literals too despite throwing a type error.
    // should be probably fixed at some point...
    // @ts-expect-error
    createTypeReferenceNode({ typeName: type }),
  );
  const argumentsArray = args
    .map((arg) =>
      ts.isExpression(arg) ? arg : createIdentifier({ text: arg }),
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

export const createReturnVariable = ({
  expression,
}: {
  expression: string | ts.Expression;
}) => {
  const statement = createReturnStatement({
    expression:
      typeof expression === 'string'
        ? createIdentifier({ text: expression })
        : expression,
  });
  return statement;
};
