import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';
import type { TsVariableDeclarationList } from './variable-declaration-list';

export interface TsVariableStatement extends TsNodeBase {
  declarationList: TsVariableDeclarationList;
  kind: TsNodeKind.VariableStatement;
}

export function createVariableStatement(
  modifiers: undefined,
  declarationList: TsVariableDeclarationList,
): TsVariableStatement {
  return {
    declarationList,
    kind: TsNodeKind.VariableStatement,
  };
}
