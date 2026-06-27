import type { TsNodeBase } from '../base';
import type { TsExpression } from '../expression';
import { TsNodeKind } from '../kinds';
import type { TsToken } from '../token';
import type { TsNamedExports } from './named-exports';
import type { TsNamespaceExport } from './namespace-export';

export interface TsExportDeclaration extends TsNodeBase {
  exportClause?: TsNamedExports | TsNamespaceExport;
  kind: TsNodeKind.ExportDeclaration;
  modifiers?: ReadonlyArray<TsToken>;
  moduleSpecifier?: TsExpression;
  typeOnlyToken?: TsToken;
}

export function createExportDeclaration(
  modifiers: ReadonlyArray<TsToken> | undefined,
  typeOnlyToken: TsToken | undefined,
  exportClause: TsNamedExports | TsNamespaceExport | undefined,
  moduleSpecifier?: TsExpression,
): TsExportDeclaration {
  return {
    exportClause,
    kind: TsNodeKind.ExportDeclaration,
    modifiers,
    moduleSpecifier,
    typeOnlyToken,
  };
}
