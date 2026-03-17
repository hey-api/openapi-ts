import type { PyNodeBase } from '../base';
import { PyNodeKind } from '../kinds';

export interface PyImportStatement extends PyNodeBase {
  isFrom: boolean;
  kind: PyNodeKind.ImportStatement;
  module: string;
  names?: ReadonlyArray<{ alias?: string; name: string }>;
}

export function createImportStatement(
  module: string,
  names?: ReadonlyArray<{ alias?: string; name: string }>,
  isFrom: boolean = false,
): PyImportStatement {
  return {
    isFrom,
    kind: PyNodeKind.ImportStatement,
    module,
    names,
  };
}
