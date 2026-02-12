import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';
import type { PyIdentifier } from './identifier';

export interface PyMemberExpression extends PyNodeBase {
  kind: PyNodeKind.MemberExpression;
  member: PyIdentifier;
  object: PyExpression;
}

export function createMemberExpression(
  object: PyExpression,
  member: PyIdentifier,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyMemberExpression {
  return {
    kind: PyNodeKind.MemberExpression,
    leadingComments,
    member,
    object,
    trailingComments,
  };
}
