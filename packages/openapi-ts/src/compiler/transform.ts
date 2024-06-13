import ts from 'typescript';

const getSafeAccessExpression = (path: string[]) =>
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

const getAccessExpression = (path: string[]) =>
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

export const createDateTransformMutation = ({
  path,
}: {
  path: string[];
}): ts.Statement => {
  const safeAccessExpression = getSafeAccessExpression(path);
  const accessExpression = getAccessExpression(path);

  const statement = ts.factory.createIfStatement(
    safeAccessExpression,
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
  transformer,
}: {
  path: string[];
  transformer: string;
}): ts.Statement => {
  const safeAccessExpression = getSafeAccessExpression(path);
  const accessExpression = getAccessExpression(path);

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
            ts.factory.createPropertyAccessExpression(
              accessExpression,
              ts.factory.createIdentifier('forEach'),
            ),
            undefined,
            undefined,
            [ts.factory.createIdentifier(transformer)],
          ),
        ),
      ],
      true,
    ),
  );

  return statement;
};

export const createDateTransformerExpression = ({
  parameterName,
}: {
  parameterName: string;
}) => ts.factory.createNewExpression(
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
  const safeAccessExpression = getSafeAccessExpression(path);
  const accessExpression = getAccessExpression(path);

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
          ts.factory.createBinaryExpression(
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
        ),
      ],
      true,
    ),
    undefined,
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
