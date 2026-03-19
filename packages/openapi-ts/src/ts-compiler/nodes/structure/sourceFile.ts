import type { TsNode, TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';

export interface TsSourceFile extends TsNodeBase {
  kind: TsNodeKind.SourceFile;
  statements: ReadonlyArray<TsNode>;
}

export function createSourceFile(
  statements: ReadonlyArray<TsNode>,
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
