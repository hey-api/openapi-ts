import type { TsNodeBase } from '../base';
import type { TsEntityName } from '../expressions/qualified-name';
import { TsNodeKind } from '../kinds';
import type { TsTypeNode } from '../type';

export interface TsImportTypeNode extends TsNodeBase {
  argument: TsTypeNode;
  isTypeOf: boolean;
  kind: TsNodeKind.ImportType;
  qualifier?: TsEntityName;
  typeArguments?: ReadonlyArray<TsTypeNode>;
}

export function createImportTypeNode(
  argument: TsTypeNode,
  attributes: undefined,
  qualifier: TsEntityName | undefined,
  typeArguments: ReadonlyArray<TsTypeNode> | undefined,
  isTypeOf: boolean = false,
): TsImportTypeNode {
  return {
    argument,
    isTypeOf,
    kind: TsNodeKind.ImportType,
    qualifier,
    typeArguments,
  };
}
