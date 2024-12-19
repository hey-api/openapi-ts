import ts from 'typescript';

import { validTypescriptIdentifierRegExp } from '../utils/regexp';
import { expressionToStatement } from './convert';
import { createCallExpression } from './module';
import {
  createArrowFunction,
  createBlock,
  createNewExpression,
  createPropertyAccessChain,
  createPropertyAccessExpression,
} from './types';
import { createIdentifier } from './utils';

export const createSafeAccessExpression = (path: string[]) =>
  path.slice(1).reduce<ts.Expression>(
    (expression, element) => {
      validTypescriptIdentifierRegExp.lastIndex = 0;
      if (validTypescriptIdentifierRegExp.test(element)) {
        return createPropertyAccessChain({
          expression,
          name: element,
        });
      }

      return ts.factory.createElementAccessChain(
        expression,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        createIdentifier({ text: element }),
      );
    },
    createIdentifier({ text: path[0]! }),
  );

export const createAccessExpression = (path: string[]) =>
  path.slice(1).reduce<ts.Expression>(
    (expression, element) =>
      createPropertyAccessExpression({
        expression,
        name: element,
      }),
    createIdentifier({ text: path[0]! }),
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
      // @ts-expect-error
      name,
    });
    return node;
  });
  return expression as ts.PropertyAccessExpression;
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
  elseStatement,
  expression,
  thenStatement,
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

  const thenStatement = createBlock({
    statements: [
      expressionToStatement({
        expression: ts.factory.createBinaryExpression(
          accessExpression,
          ts.SyntaxKind.EqualsToken,
          createNewExpression({
            argumentsArray: [accessExpression],
            expression: createIdentifier({ text: 'Date' }),
          }),
        ),
      }),
    ],
  });

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

  const thenStatement = createBlock({
    statements: [
      expressionToStatement({
        expression: createCallExpression({
          functionName: transformerName,
          parameters: [accessExpression],
        }),
      }),
    ],
  });

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
    thenStatement: createBlock({
      statements: [
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
    }),
  });

  return statement;
};

export const createDateTransformerExpression = ({
  parameterName,
}: {
  parameterName: string;
}) => {
  const expression = createIdentifier({ text: 'Date' });
  const newExpression = createNewExpression({
    argumentsArray: [createIdentifier({ text: parameterName })],
    expression,
  });
  return newExpression;
};

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
    thenStatement: createBlock({
      statements: [
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
    }),
  });

  return statement;
};
