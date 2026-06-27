import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';
import type { TsToken } from '../token';
import type { TsTypeNode } from '../type';

export interface TsNamedTupleMember extends TsNodeBase {
  dotDotDotToken?: TsToken;
  kind: TsNodeKind.NamedTupleMember;
  name: string;
  questionToken?: TsToken;
  type: TsTypeNode;
}

export function createNamedTupleMember(
  dotDotDotToken: TsToken | undefined,
  name: string,
  questionToken: TsToken | undefined,
  type: TsTypeNode,
): TsNamedTupleMember {
  return {
    dotDotDotToken,
    kind: TsNodeKind.NamedTupleMember,
    name,
    questionToken,
    type,
  };
}
