import type { PyExpression } from './expression';
import type { PyNodeKind } from './kinds';
import type { PyStatement } from './statement';
import type { PyBlock } from './statements/block';
import type { PySourceFile } from './structure/sourceFile';

export interface PyNodeBase {
  kind: PyNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type PyNode = PyBlock | PyExpression | PySourceFile | PyStatement;
