import type { TsNodeBase } from '../base';
import { TsNodeKind } from '../kinds';
import type { TsModuleExportName } from '../module-export-name';
import type { TsToken } from '../token';

export interface TsExportSpecifier extends TsNodeBase {
  kind: TsNodeKind.ExportSpecifier;
  name: TsModuleExportName;
  propertyName?: TsModuleExportName;
  typeOnlyToken?: TsToken;
}

export function createExportSpecifier(
  typeOnlyToken: TsToken | undefined,
  propertyName: TsModuleExportName | undefined,
  name: TsModuleExportName,
): TsExportSpecifier {
  return {
    kind: TsNodeKind.ExportSpecifier,
    name,
    propertyName,
    typeOnlyToken,
  };
}
