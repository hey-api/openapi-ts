import type { PyNode, PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PySourceFile extends PyNodeBase {
  docstring?: string;
  kind: PyNodeKind.SourceFile;
  statements: ReadonlyArray<PyNode>;
}

export function createSourceFile(
  statements: ReadonlyArray<PyNode>,
  docstring?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): PySourceFile {
  return {
    docstring,
    kind: PyNodeKind.SourceFile,
    leadingComments,
    statements,
    trailingComments,
  };
}
