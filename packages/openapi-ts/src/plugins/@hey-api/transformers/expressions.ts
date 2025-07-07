import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { TypeScriptFile } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import type { Config } from './types';

export type ExpressionTransformer = ({
  config,
  dataExpression,
  file,
  schema,
}: {
  config: Omit<Config, 'name'>;
  dataExpression?: ts.Expression | string;
  file: TypeScriptFile;
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
      ? compiler.callExpression({
          functionName: 'BigInt',
          parameters: [
            compiler.callExpression({
              functionName: compiler.propertyAccessExpression({
                expression: dataExpression,
                name: 'toString',
              }),
            }),
          ],
        })
      : undefined;

  if (bigIntCallExpression) {
    if (typeof dataExpression === 'string') {
      return [bigIntCallExpression];
    }

    if (dataExpression) {
      return [
        compiler.assignment({
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

  const identifierDate = compiler.identifier({ text: 'Date' });

  if (typeof dataExpression === 'string') {
    return [
      compiler.newExpression({
        argumentsArray: [compiler.identifier({ text: dataExpression })],
        expression: identifierDate,
      }),
    ];
  }

  if (dataExpression) {
    return [
      compiler.assignment({
        left: dataExpression,
        right: compiler.newExpression({
          argumentsArray: [dataExpression],
          expression: identifierDate,
        }),
      }),
    ];
  }

  return;
};
