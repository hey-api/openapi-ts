import ts from 'typescript';

import { expressionToStatement } from './convert';
import { createCallExpression } from './module';
import { createArrowFunction, createPropertyAccessExpression } from './types';
import { createIdentifier, ots } from './utils';

export const createSafeAccessExpression = (path: string[]) =>
  path
    .slice(1)
    .reduce<ts.Expression>(
      (expression, element) =>
        ts.factory.createPropertyAccessChain(
          expression,
          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
          createIdentifier({ text: element }),
        ),
      createIdentifier({ text: path[0] }),
    );

export const createAccessExpression = (path: string[]) =>
  path.slice(1).reduce<ts.Expression>(
    (expression, element) =>
      createPropertyAccessExpression({
        expression,
        name: element,
      }),
    createIdentifier({ text: path[0] }),
  );

/**
 * Handles an array of access expressions instead of nesting them (default TypeScript syntax)
 */
export const createPropertyAccessExpressions = ({
  expressions,
}: {
  expressions: Array<string | ts.Expression | ts.MemberName>;
}): ts.PropertyAccessExpression => {
  const expression = expressions.reduce((expression, name) => {
    const node = createPropertyAccessExpression({
      expression,
      // @ts-ignore
      name,
    });
    return node;
  });
  return expression as ts.PropertyAccessExpression;
};

export const createElementAccessExpression = ({
  index,
  name,
}: {
  index: number;
  name: string;
}) => {
  const expression = ts.factory.createElementAccessExpression(
    createIdentifier({ text: name }),
    ots.number(index),
  );
  return expression;
};

export const createBinaryExpression = ({
  left,
  operator = '=',
  right,
}: {
  left: ts.Expression;
  operator?: '=' | '===' | 'in';
  right: ts.Expression | string;
}) => {
  const expression = ts.factory.createBinaryExpression(
    left,
    // TODO: add support for other tokens
    operator === '='
      ? ts.SyntaxKind.EqualsToken
      : operator === '==='
        ? ts.SyntaxKind.EqualsEqualsEqualsToken
        : ts.SyntaxKind.InKeyword,
    typeof right === 'string' ? createIdentifier({ text: right }) : right,
  );
  return expression;
};

export const createIfStatement = ({
  expression,
  thenStatement,
  elseStatement,
}: {
  elseStatement?: ts.Statement;
  expression: ts.Expression;
  thenStatement: ts.Statement;
}) => ts.factory.createIfStatement(expression, thenStatement, elseStatement);

export const createDateTransformMutation = ({
  path,
}: {
  path: string[];
}): ts.Statement => {
  const safeAccessExpression = createSafeAccessExpression(path);
  const accessExpression = createAccessExpression(path);

  const thenStatement = ts.factory.createBlock([
    expressionToStatement({
      expression: ts.factory.createBinaryExpression(
        accessExpression,
        ts.SyntaxKind.EqualsToken,
        ts.factory.createNewExpression(
          createIdentifier({ text: 'Date' }),
          undefined,
          [accessExpression],
        ),
      ),
    }),
  ]);

  const statement = createIfStatement({
    expression: safeAccessExpression,
    thenStatement,
  });

  return statement;
};

export const createFunctionTransformMutation = ({
  path,
  transformerName,
}: {
  path: string[];
  transformerName: string;
}) => {
  const safeAccessExpression = createSafeAccessExpression(path);
  const accessExpression = createAccessExpression(path);

  const thenStatement = ts.factory.createBlock(
    [
      expressionToStatement({
        expression: createCallExpression({
          functionName: transformerName,
          parameters: [accessExpression],
        }),
      }),
    ],
    true,
  );

  const statement = [
    createIfStatement({
      expression: safeAccessExpression,
      thenStatement,
    }),
  ];

  return statement;
};

export const createArrayTransformMutation = ({
  path,
  transformerName,
}: {
  path: string[];
  transformerName: string;
}): ts.Statement => {
  const safeAccessExpression = createSafeAccessExpression(path);
  const accessExpression = createAccessExpression(path);

  const statement = createIfStatement({
    expression: createCallExpression({
      functionName: createPropertyAccessExpression({
        expression: 'Array',
        name: 'isArray',
      }),
      parameters: [safeAccessExpression],
    }),
    thenStatement: ts.factory.createBlock(
      [
        expressionToStatement({
          expression: ts.factory.createCallChain(
            createPropertyAccessExpression({
              expression: accessExpression,
              name: 'forEach',
            }),
            undefined,
            undefined,
            [createIdentifier({ text: transformerName })],
          ),
        }),
      ],
      true,
    ),
  });

  return statement;
};

export const createDateTransformerExpression = ({
  parameterName,
}: {
  parameterName: string;
}) =>
  ts.factory.createNewExpression(
    createIdentifier({ text: 'Date' }),
    undefined,
    [createIdentifier({ text: parameterName })],
  );

export const createArrayMapTransform = ({
  path,
  transformExpression,
}: {
  path: string[];
  transformExpression: ts.Expression;
}) => {
  const safeAccessExpression = createSafeAccessExpression(path);
  const accessExpression = createAccessExpression(path);

  const statement = createIfStatement({
    expression: createCallExpression({
      functionName: createPropertyAccessExpression({
        expression: 'Array',
        name: 'isArray',
      }),
      parameters: [safeAccessExpression],
    }),
    thenStatement: ts.factory.createBlock(
      [
        expressionToStatement({
          expression: ts.factory.createBinaryExpression(
            accessExpression,
            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
            ts.factory.createCallChain(
              createPropertyAccessExpression({
                expression: accessExpression,
                name: 'map',
              }),
              undefined,
              undefined,
              [
                createArrowFunction({
                  parameters: [
                    {
                      name: 'item',
                    },
                  ],
                  statements: transformExpression,
                }),
              ],
            ),
          ),
        }),
      ],
      true,
    ),
  });

  return statement;
};
