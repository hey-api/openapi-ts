import type { TsExpression } from './expression';
import type { TsNodeKind } from './kinds';
import type { TsStatement } from './statement';
// import type { TsBlock } from './statements/block';
import type { TsSourceFile } from './structure/sourceFile';

export interface TsNodeBase {
  kind: TsNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

// TsBlock |
export type TsNode = TsExpression | TsSourceFile | TsStatement;
