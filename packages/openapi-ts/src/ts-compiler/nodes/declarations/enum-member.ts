import type { TsNodeBase } from '../base';
import type { TsExpression } from '../expression';
import { TsNodeKind } from '../kinds';

export interface TsEnumMember extends TsNodeBase {
  initializer?: TsExpression;
  kind: TsNodeKind.EnumMember;
  name: string;
}

export function createEnumMember(name: string, initializer?: TsExpression): TsEnumMember {
  return {
    initializer,
    kind: TsNodeKind.EnumMember,
    name,
  };
}
