import type { TsArrayTypeNode } from './types/array-type-node';
import type { TsConditionalTypeNode } from './types/conditional-type-node';
import type { TsFunctionTypeNode } from './types/function-type-node';
import type { TsIndexedAccessTypeNode } from './types/indexed-access-type-node';
import type { TsIntersectionTypeNode } from './types/intersection-type-node';
import type { TsKeywordTypeNode } from './types/keyword-type-node';
import type { TsLiteralTypeNode } from './types/literal-type-node';
import type { TsMappedTypeNode } from './types/mapped-type-node';
import type { TsNamedTupleMember } from './types/named-tuple-member';
import type { TsTemplateLiteralType } from './types/template-literal-type';
import type { TsTemplateLiteralTypeSpan } from './types/template-literal-type-span';
import type { TsTupleTypeNode } from './types/tuple-type-node';
import type { TsTypeLiteralNode } from './types/type-literal-node';
import type { TsTypeOperatorNode } from './types/type-operator-node';
import type { TsTypeQueryNode } from './types/type-query-node';
import type { TsTypeReferenceNode } from './types/type-reference-node';
import type { TsUnionTypeNode } from './types/union-type-node';

export type TsTypeNode =
  | TsArrayTypeNode
  | TsConditionalTypeNode
  | TsFunctionTypeNode
  | TsIndexedAccessTypeNode
  | TsIntersectionTypeNode
  | TsKeywordTypeNode
  | TsLiteralTypeNode
  | TsMappedTypeNode
  | TsNamedTupleMember
  | TsTemplateLiteralType
  | TsTemplateLiteralTypeSpan
  | TsTupleTypeNode
  | TsTypeLiteralNode
  | TsTypeOperatorNode
  | TsTypeQueryNode
  | TsTypeReferenceNode
  | TsUnionTypeNode;
