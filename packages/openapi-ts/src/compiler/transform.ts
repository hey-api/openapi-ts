import ts from 'typescript';

import { convertExpressionToStatement } from './convert';
import { createCallExpression } from './module';
import { createReturnStatement } from './return';

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
    convertExpressionToStatement({
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
      convertExpressionToStatement({
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
        convertExpressionToStatement({
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
        convertExpressionToStatement({
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
                ts.factory.createArrowFunction(
                  undefined,
                  undefined,
                  [
                    ts.factory.createParameterDeclaration(
                      undefined,
                      undefined,
                      ts.factory.createIdentifier('item'),
                      undefined,
                      undefined,
                      undefined,
                    ),
                  ],
                  undefined,
                  ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                  transformExpression,
                ),
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

export const createAlias = ({
  existingName,
  name,
}: {
  existingName: string;
  name: string;
}) =>
  ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(name),
          undefined,
          undefined,
          ts.factory.createIdentifier(existingName),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

export const createResponseArrayTransform = ({
  transform,
  name,
}: {
  name: string;
  transform: string;
}) => {
  const transformFunction = ts.factory.createArrowFunction(
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier('data'),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        undefined,
      ),
    ],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(
      [
        createIfStatement({
          expression: createCallExpression({
            functionName: ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('Array'),
              ts.factory.createIdentifier('isArray'),
            ),
            parameters: ['data'],
          }),
          thenStatement: ts.factory.createBlock(
            [
              convertExpressionToStatement({
                expression: createCallExpression({
                  functionName: ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('data'),
                    ts.factory.createIdentifier('forEach'),
                  ),
                  parameters: [transform],
                }),
              }),
            ],
            true,
          ),
        }),
        createReturnStatement({
          expression: ts.factory.createIdentifier('data'),
        }),
      ],
      true,
    ),
  );

  const declaration = ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(name),
          undefined,
          undefined,
          transformFunction,
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

  return declaration;
};
