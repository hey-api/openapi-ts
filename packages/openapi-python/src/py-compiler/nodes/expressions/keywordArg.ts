import type { PyNodeBase } from '../base';
import type { PyExpression } from '../expression';
import { PyNodeKind } from '../kinds';

export interface PyKeywordArgument extends PyNodeBase {
  kind: PyNodeKind.KeywordArgument;
  name: string;
  value: PyExpression;
}

export function createKeywordArgument(
  name: string,
  value: PyExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyKeywordArgument {
  return {
    kind: PyNodeKind.KeywordArgument,
    leadingComments,
    name,
    trailingComments,
    value,
  };
}
