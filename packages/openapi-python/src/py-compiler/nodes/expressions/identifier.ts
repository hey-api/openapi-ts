import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyIdentifier extends PyNodeBase {
  kind: PyNodeKind.Identifier;
  name: string;
}

export function createIdentifier(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PyIdentifier {
  return {
    kind: PyNodeKind.Identifier,
    leadingComments,
    name,
    trailingComments,
  };
}
