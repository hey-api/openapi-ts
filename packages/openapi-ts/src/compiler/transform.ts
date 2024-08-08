import ts from 'typescript';

import { expressionToStatement } from './convert';
import { createCallExpression } from './module';
import { createArrowFunction } from './types';

export const createSafeAccessExpression = (path: string[]) =>
  path
    .slice(1)
    .reduce<ts.Expression>(
      (expression, element) =>
        ts.factory.createPropertyAccessChain(
          expression,
          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
          ts.factory.createIdentifier(element),
        ),
      ts.factory.createIdentifier(path[0]),
    );

export const createAccessExpression = (path: string[]) =>
  path
    .slice(1)
    .reduce<ts.Expression>(
      (expression, element) =>
        ts.factory.createPropertyAccessExpression(
          expression,
          ts.factory.createIdentifier(element),
        ),
      ts.factory.createIdentifier(path[0]),
    );

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
          ts.factory.createIdentifier('Date'),
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
      functionName: ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('Array'),
        ts.factory.createIdentifier('isArray'),
      ),
      parameters: [safeAccessExpression],
    }),
    thenStatement: ts.factory.createBlock(
      [
        expressionToStatement({
          expression: ts.factory.createCallChain(
            ts.factory.createPropertyAccessExpression(
              accessExpression,
              ts.factory.createIdentifier('forEach'),
            ),
            undefined,
            undefined,
            [ts.factory.createIdentifier(transformerName)],
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
    ts.factory.createIdentifier('Date'),
    undefined,
    [ts.factory.createIdentifier(parameterName)],
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
      functionName: ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('Array'),
        ts.factory.createIdentifier('isArray'),
      ),
      parameters: [safeAccessExpression],
    }),
    thenStatement: ts.factory.createBlock(
      [
        expressionToStatement({
          expression: ts.factory.createBinaryExpression(
            accessExpression,
            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
            ts.factory.createCallChain(
              ts.factory.createPropertyAccessExpression(
                accessExpression,
                ts.factory.createIdentifier('map'),
              ),
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
