import type { TsNodeBase } from '../base';
import type { TsExpression } from '../expression';
import { TsNodeKind } from '../kinds';
import type { TsType } from '../type';

export type TsVariableKeyword = 'var' | 'let' | 'const';

export interface TsVariableStatement extends TsNodeBase {
  initializer?: TsExpression;
  keyword: TsVariableKeyword;
  kind: TsNodeKind.VariableStatement;
  name: string;
  typeAnnotation?: TsType;
}

export function createVariableStatement(
  keyword: TsVariableKeyword,
  name: string,
  initializer?: TsExpression,
  typeAnnotation?: TsType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): TsVariableStatement {
  return {
    initializer,
    keyword,
    kind: TsNodeKind.VariableStatement,
    leadingComments,
    name,
    trailingComments,
    typeAnnotation,
  };
}
