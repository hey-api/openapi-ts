import ts from 'typescript';

import {
  addLeadingJSDocComment,
  type Comments,
  ots,
  tsNodeToString,
} from './utils';

const nullNode = ts.factory.createTypeReferenceNode('null');

export const createTypeNode = (
  base: any | ts.TypeNode,
  args?: (any | ts.TypeNode)[],
): ts.TypeNode => {
  if (ts.isTypeNode(base)) {
    return base;
  }

  if (typeof base === 'number') {
    return ts.factory.createLiteralTypeNode(ots.number(base));
  }

  return ts.factory.createTypeReferenceNode(
    base,
    args?.map((arg) => createTypeNode(arg)),
  );
};

/**
 * Create a type alias declaration. Example `export type X = Y;`.
 * @param comment (optional) comments to add
 * @param name the name of the type
 * @param type the type
 * @returns ts.TypeAliasDeclaration
 */
export const createTypeAliasDeclaration = ({
  comment,
  name,
  type,
}: {
  comment?: Comments;
  name: string;
  type: string | ts.TypeNode;
}): ts.TypeAliasDeclaration => {
  const node = ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(name),
    [],
    createTypeNode(type),
  );
  if (comment) {
    addLeadingJSDocComment(node, comment);
  }
  return node;
};

// Property of a interface type node.
export type Property = {
  comment?: Comments;
  isReadOnly?: boolean;
  isRequired?: boolean;
  name: string;
  type: any | ts.TypeNode;
};

/**
 * Returns a union of provided node with null if marked as nullable,
 * otherwise returns the provided node unmodified.
 */
const maybeNullable = ({
  isNullable,
  node,
}: {
  isNullable: boolean;
  node: ts.TypeNode;
}) => {
  if (!isNullable) {
    return node;
  }
  return ts.factory.createUnionTypeNode([node, nullNode]);
};

/**
 * Create a interface type node. Example `{ readonly x: string, y?: number }`
 * @param properties - the properties of the interface.
 * @param isNullable - if the whole interface can be nullable
 * @returns ts.TypeLiteralNode | ts.TypeUnionNode
 */
export const createTypeInterfaceNode = (
  properties: Property[],
  isNullable: boolean = false,
) => {
  const node = ts.factory.createTypeLiteralNode(
    properties.map((property) => {
      const signature = ts.factory.createPropertySignature(
        property.isReadOnly
          ? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)]
          : undefined,
        property.name,
        property.isRequired
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        createTypeNode(property.type),
      );
      if (property.comment) {
        addLeadingJSDocComment(signature, property.comment);
      }
      return signature;
    }),
  );
  return maybeNullable({ isNullable, node });
};

/**
 * Create type union node. Example `string | number | boolean`
 * @param types - the types in the union
 * @param isNullable - if the whole type can be null
 * @returns ts.UnionTypeNode
 */
export const createTypeUnionNode = (
  types: (any | ts.TypeNode)[],
  isNullable: boolean = false,
) => {
  const nodes = types.map((type) => createTypeNode(type));
  if (!isNullable) {
    return ts.factory.createUnionTypeNode(nodes);
  }
  return ts.factory.createUnionTypeNode([...nodes, nullNode]);
};

/**
 * Create type intersect node. Example `string & number & boolean`
 * @param types - the types in the union
 * @param isNullable - if the whole type can be null
 * @returns ts.IntersectionTypeNode | ts.UnionTypeNode
 */
export const createTypeIntersectNode = (
  types: (any | ts.TypeNode)[],
  isNullable: boolean = false,
) => {
  const nodes = types.map((type) => createTypeNode(type));
  const node = ts.factory.createIntersectionTypeNode(nodes);
  return maybeNullable({ isNullable, node });
};

/**
 * Create type tuple node. Example `string, number, boolean`
 * @param isNullable if the whole type can be null
 * @param types the types in the union
 * @returns ts.UnionTypeNode
 */
export const createTypeTupleNode = ({
  isNullable = false,
  types,
}: {
  isNullable?: boolean;
  types: Array<any | ts.TypeNode>;
}) => {
  const nodes = types.map((type) => createTypeNode(type));
  const node = ts.factory.createTupleTypeNode(nodes);
  return maybeNullable({ isNullable, node });
};

/**
 * Create type record node. Example `{ [key: string]: string }`
 * @param keys - key types.
 * @param values - value types.
 * @param isNullable - if the whole type can be null
 * @returns ts.TypeReferenceNode | ts.UnionTypeNode
 */
export const createTypeRecordNode = (
  keys: (any | ts.TypeNode)[],
  values: (any | ts.TypeNode)[],
  isNullable: boolean = false,
) => {
  const keyNode = createTypeUnionNode(keys);
  const valueNode = createTypeUnionNode(values);
  // NOTE: We use the syntax `{ [key: string]: string }` because using a Record causes
  //       invalid types with circular dependencies. This is functionally the same.
  // Ref: https://github.com/hey-api/openapi-ts/issues/370
  const node = createTypeInterfaceNode([
    {
      isRequired: true,
      name: `[key: ${tsNodeToString({ node: keyNode, unescape: true })}]`,
      type: valueNode,
    },
  ]);
  return maybeNullable({ isNullable, node });
};

/**
 * Create type array node. Example `Array<string | number>`
 * @param types - the types
 * @param isNullable - if the whole type can be null
 * @returns ts.TypeReferenceNode | ts.UnionTypeNode
 */
export const createTypeArrayNode = (
  types: (any | ts.TypeNode)[],
  isNullable: boolean = false,
) => {
  const node = ts.factory.createTypeReferenceNode('Array', [
    createTypeUnionNode(types),
  ]);
  return maybeNullable({ isNullable, node });
};
