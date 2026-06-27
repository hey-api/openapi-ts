import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';
import type { TsStatement } from '../statement';

export interface TsSourceFile extends TsNodeBase {
  kind: TsNodeKind.SourceFile;
  statements: ReadonlyArray<TsStatement>;
}

export function createSourceFile(
  statements: ReadonlyArray<TsStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): TsSourceFile {
  return {
    kind: TsNodeKind.SourceFile,
    leadingComments,
    statements,
    trailingComments,
  };
}
