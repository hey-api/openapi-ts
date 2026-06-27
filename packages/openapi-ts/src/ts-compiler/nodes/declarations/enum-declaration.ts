import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';
import type { TsToken } from '../token';
import type { TsEnumMember } from './enum-member';

export interface TsEnumDeclaration extends TsNodeBase {
  kind: TsNodeKind.EnumDeclaration;
  members: ReadonlyArray<TsEnumMember>;
  modifiers?: ReadonlyArray<TsToken>;
  name: string;
}

export function createEnumDeclaration(
  modifiers: ReadonlyArray<TsToken> | undefined,
  name: string,
  members: ReadonlyArray<TsEnumMember>,
): TsEnumDeclaration {
  return {
    kind: TsNodeKind.EnumDeclaration,
    members,
    modifiers,
    name,
  };
}
