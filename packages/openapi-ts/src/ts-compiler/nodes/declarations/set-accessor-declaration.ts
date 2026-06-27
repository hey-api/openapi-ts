import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';
import type { TsStatement } from '../statement';
import type { TsModifierLike } from './modifier-like';
import type { TsParameterDeclaration } from './parameter-declaration';

export interface TsSetAccessorDeclaration extends TsNodeBase {
  body?: TsStatement;
  kind: TsNodeKind.SetAccessor;
  modifiers?: ReadonlyArray<TsModifierLike>;
  name: string;
  parameters: ReadonlyArray<TsParameterDeclaration>;
}

export function createSetAccessorDeclaration(
  modifiers: ReadonlyArray<TsModifierLike> | undefined,
  name: string,
  parameters: ReadonlyArray<TsParameterDeclaration>,
  body: TsStatement | undefined,
): TsSetAccessorDeclaration {
  return {
    body,
    kind: TsNodeKind.SetAccessor,
    modifiers,
    name,
    parameters,
  };
}
