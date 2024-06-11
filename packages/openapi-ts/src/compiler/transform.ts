import ts from 'typescript';

export const createDateTransformMutation = ({
  path,
}: {
  path: string[];
}): ts.Statement => {
  const truthyExpression = path
    .slice(1)
    .reduce<ts.Expression>((expression, element) => ts.factory.createPropertyAccessChain(
        expression,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier(element),
      ), ts.factory.createIdentifier(path[0]));

  const accessExpression = path
    .slice(1)
    .reduce<ts.Expression>((expression, element) => ts.factory.createPropertyAccessExpression(
        expression,
        ts.factory.createIdentifier(element),
      ), ts.factory.createIdentifier(path[0]));

  const statement = ts.factory.createIfStatement(
    truthyExpression,
    ts.factory.createBlock([
      ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(
          accessExpression,
          ts.SyntaxKind.EqualsToken,
          ts.factory.createNewExpression(
            ts.factory.createIdentifier('Date'),
            undefined,
            [accessExpression],
          ),
        ),
      ),
    ]),
  );

  return statement;
};

export const createArrayTransformMutation = ({
  path,
  statements,
}: {
  path: string[];
  statements: ts.Statement[];
}): ts.Statement => {
  const safeAccessExpression = path
    .slice(1)
    .reduce<ts.Expression>((expression, element) => ts.factory.createPropertyAccessChain(
        expression,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier(element),
      ), ts.factory.createIdentifier(path[0]));

  const statement = ts.factory.createIfStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('Array'),
        ts.factory.createIdentifier('isArray'),
      ),
      undefined,
      [safeAccessExpression],
    ),
    ts.factory.createBlock(
      [
        ts.factory.createExpressionStatement(
          ts.factory.createCallChain(
            ts.factory.createPropertyAccessChain(
              safeAccessExpression,
              undefined,
              ts.factory.createIdentifier('forEach'),
            ),
            undefined,
            undefined,
            [
              ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createBlock(statements, true),
              ),
            ],
          ),
        ),
      ],
      true,
    ),
  );

  return statement;
};

export const createTransformMutationFunction = ({
  modelName,
  statements,
}: {
  modelName: string;
  statements: ts.Statement[];
}) => {
  const transformFunction = ts.factory.createFunctionDeclaration(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    undefined,
    ts.factory.createIdentifier(modelName),
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
    ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier(modelName),
      undefined,
    ),
    ts.factory.createBlock(
      [
        ...statements,
        ts.factory.createReturnStatement(ts.factory.createIdentifier('data')),
      ],
      true,
    ),
  );

  return transformFunction;
};
