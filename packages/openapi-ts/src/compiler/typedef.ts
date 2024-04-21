import ts from 'typescript';

import { addLeadingJSDocComment, type Comments, tsNodeToString } from './utils';

export const createTypeNode = (
  base: any | ts.TypeNode,
  args?: (any | ts.TypeNode)[],
): ts.TypeNode => {
  if (ts.isTypeNode(base)) {
    return base;
  }

  if (typeof base === 'number') {
    return ts.factory.createLiteralTypeNode(
      ts.factory.createNumericLiteral(base),
    );
  }

  return ts.factory.createTypeReferenceNode(
    base,
    args?.map((arg) => createTypeNode(arg)),
  );
};

/**
 * Create a type alias declaration. Example `export type X = Y;`.
 * @param name - the name of the type.
 * @param type - the type.
 * @param comments - comments to add if any.
 * @returns ts.TypeAliasDeclaration
 */
export const createTypeAliasDeclaration = (
  name: string,
  type: string | ts.TypeNode,
  comments?: Comments,
): ts.TypeAliasDeclaration => {
  const node = ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(name),
    [],
    createTypeNode(type),
  );
  if (comments?.length) {
    addLeadingJSDocComment(node, comments);
  }
  return node;
};

// Property of a interface type node.
export type Property = {
  name: string;
  type: any | ts.TypeNode;
  isRequired?: boolean;
  isReadOnly?: boolean;
  comment?: Comments;
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
      const comment = property.comment;
      if (comment) {
        addLeadingJSDocComment(signature, comment);
      }
      return signature;
    }),
  );
  if (!isNullable) {
    return node;
  }
  return ts.factory.createUnionTypeNode([
    node,
    ts.factory.createTypeReferenceNode('null'),
  ]);
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
  const nodes = types.map((t) => createTypeNode(t));
  if (isNullable) {
    nodes.push(ts.factory.createTypeReferenceNode('null'));
  }
  return ts.factory.createUnionTypeNode(nodes);
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
  const nodes = types.map((t) => createTypeNode(t));
  const intersect = ts.factory.createIntersectionTypeNode(nodes);
  if (isNullable) {
    return ts.factory.createUnionTypeNode([
      intersect,
      ts.factory.createTypeReferenceNode('null'),
    ]);
  }
  return intersect;
};

/**
 * Create type tuple node. Example `string, number, boolean`
 * @param types - the types in the union
 * @param isNullable - if the whole type can be null
 * @returns ts.UnionTypeNode
 */
export const createTypeTupleNode = (
  types: (any | ts.TypeNode)[],
  isNullable: boolean = false,
) => {
  const nodes = types.map((t) => createTypeNode(t));
  if (isNullable) {
    nodes.push(ts.factory.createTypeReferenceNode('null'));
  }
  return ts.factory.createTupleTypeNode(nodes);
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
      name: `[key: ${tsNodeToString(keyNode)}]`,
      type: valueNode,
    },
  ]);
  if (!isNullable) {
    return node;
  }
  return ts.factory.createUnionTypeNode([
    node,
    ts.factory.createTypeReferenceNode('null'),
  ]);
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
  if (!isNullable) {
    return node;
  }
  return ts.factory.createUnionTypeNode([
    node,
    ts.factory.createTypeReferenceNode('null'),
  ]);
};
