import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export type PyBinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '//'
  | '%'
  | '**'
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'is'
  | 'is not'
  | 'in'
  | 'not in'
  | 'and'
  | 'or';

export interface PyBinaryExpression extends PyNodeBase {
  kind: PyNodeKind.BinaryExpression;
  left: PyExpression;
  operator: PyBinaryOperator;
  right: PyExpression;
}

export function createBinaryExpression(
  left: PyExpression,
  operator: PyBinaryOperator,
  right: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyBinaryExpression {
  return {
    kind: PyNodeKind.BinaryExpression,
    leadingComments,
    left,
    operator,
    right,
    trailingComments,
  };
}
