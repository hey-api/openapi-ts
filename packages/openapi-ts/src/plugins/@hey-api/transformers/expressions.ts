import type { IR } from '@hey-api/shared';
import type ts from 'typescript';

import { $ } from '~/ts-dsl';

import type { UserConfig } from './types';

export type ExpressionTransformer = ({
  config,
  dataExpression,
  schema,
}: {
  config: Omit<UserConfig, 'name'>;
  dataExpression?:
    | ts.Expression
    | ReturnType<typeof $.expr | typeof $.attr>
    | string;
  schema: IR.SchemaObject;
}) => Array<ReturnType<typeof $.fromValue>> | undefined;

export const bigIntExpressions: ExpressionTransformer = ({
  dataExpression,
  schema,
}) => {
  if (schema.type !== 'integer' || schema.format !== 'int64') {
    return;
  }

  const bigIntCallExpression =
    dataExpression !== undefined
      ? $('BigInt').call($.expr(dataExpression).attr('toString').call())
      : undefined;

  if (bigIntCallExpression) {
    if (typeof dataExpression === 'string') {
      return [bigIntCallExpression];
    }

    if (dataExpression) {
      return [$.expr(dataExpression).assign(bigIntCallExpression)];
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

  if (typeof dataExpression === 'string') {
    return [$.new('Date').arg(dataExpression)];
  }

  if (dataExpression) {
    return [$.expr(dataExpression).assign($.new('Date').arg(dataExpression))];
  }

  return;
};
