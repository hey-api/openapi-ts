import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { tsc } from '~/tsc';

import type { UserConfig } from './types';

export type ExpressionTransformer = ({
  config,
  dataExpression,
  schema,
}: {
  config: Omit<UserConfig, 'name'>;
  dataExpression?: ts.Expression | string;
  schema: IR.SchemaObject;
}) => Array<ts.Expression> | undefined;

export const bigIntExpressions: ExpressionTransformer = ({
  dataExpression,
  schema,
}) => {
  if (schema.type !== 'integer' || schema.format !== 'int64') {
    return;
  }

  const bigIntCallExpression =
    dataExpression !== undefined
      ? tsc.callExpression({
          functionName: 'BigInt',
          parameters: [
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: dataExpression,
                name: 'toString',
              }),
            }),
          ],
        })
      : undefined;

  if (bigIntCallExpression) {
    if (typeof dataExpression === 'string') {
      // When dataExpression is a string (e.g., 'item' in a map callback),
      // return a return statement with the transformed value
      return [
        tsc.returnStatement({
          expression: bigIntCallExpression,
        }),
      ];
    }

    if (dataExpression) {
      return [
        tsc.assignment({
          left: dataExpression,
          right: bigIntCallExpression,
        }),
      ];
    }
  }

  return;
};

export const dateExpressions: ExpressionTransformer = ({
  dataExpression,
  schema,
}) => {
  if (
    schema.type !== 'string' ||
    !(schema.format === 'date' || schema.format === 'date-time')
  ) {
    return;
  }

  const identifierDate = tsc.identifier({ text: 'Date' });

  if (typeof dataExpression === 'string') {
    // When dataExpression is a string (e.g., 'item' in a map callback),
    // return a return statement with the transformed value
    return [
      tsc.returnStatement({
        expression: tsc.newExpression({
          argumentsArray: [tsc.identifier({ text: dataExpression })],
          expression: identifierDate,
        }),
      }),
    ];
  }

  if (dataExpression) {
    return [
      tsc.assignment({
        left: dataExpression,
        right: tsc.newExpression({
          argumentsArray: [dataExpression],
          expression: identifierDate,
        }),
      }),
    ];
  }

  return;
};
