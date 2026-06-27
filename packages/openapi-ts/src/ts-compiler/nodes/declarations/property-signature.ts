import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';
import type { TsToken } from '../token';
import type { TsTypeNode } from '../type';

export interface TsPropertySignature extends TsNodeBase {
  kind: TsNodeKind.PropertySignature;
  modifiers?: ReadonlyArray<TsToken>;
  name: string;
  questionToken?: TsToken;
  type?: TsTypeNode;
}

export function createPropertySignature(
  modifiers: ReadonlyArray<TsToken> | undefined,
  name: string,
  questionToken: TsToken | undefined,
  type: TsTypeNode | undefined,
): TsPropertySignature {
  return {
    kind: TsNodeKind.PropertySignature,
    modifiers,
    name,
    questionToken,
    type,
  };
}
