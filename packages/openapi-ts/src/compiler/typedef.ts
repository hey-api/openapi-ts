import ts from 'typescript';

import { createTypeNode, createTypeReferenceNode } from './types';
import { addLeadingComments, type Comments, tsNodeToString } from './utils';

const nullNode = createTypeReferenceNode({ typeName: 'null' });

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
  isNullable?: boolean;
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
export const createTypeInterfaceNode = ({
  isNullable,
  properties,
}: {
  isNullable?: boolean;
  properties: Property[];
}) => {
  const node = ts.factory.createTypeLiteralNode(
    properties.map((property) => {
      const modifiers: readonly ts.Modifier[] | undefined = property.isReadOnly
        ? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)]
        : undefined;

      const questionToken: ts.QuestionToken | undefined =
        property.isRequired !== false
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken);

      const type: ts.TypeNode | undefined = createTypeNode(property.type);

      const signature = ts.factory.createPropertySignature(
        modifiers,
        property.name,
        questionToken,
        type,
      );

      addLeadingComments({
        comments: property.comment,
        node: signature,
      });

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
export const createTypeUnionNode = ({
  isNullable,
  types,
}: {
  isNullable?: boolean;
  types: (any | ts.TypeNode)[];
}) => {
  const nodes = types.map((type) => createTypeNode(type));
  const node = ts.factory.createUnionTypeNode(nodes);
  return maybeNullable({ isNullable, node });
};

/**
 * Create type intersection node. Example `string & number & boolean`
 * @param types - the types in the union
 * @param isNullable - if the whole type can be null
 * @returns ts.IntersectionTypeNode | ts.UnionTypeNode
 */
export const createTypeIntersectionNode = ({
  isNullable,
  types,
}: {
  isNullable?: boolean;
  types: (any | ts.TypeNode)[];
}) => {
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
  const keyNode = createTypeUnionNode({
    types: keys,
  });
  const valueNode = createTypeUnionNode({
    types: values,
  });
  // NOTE: We use the syntax `{ [key: string]: string }` because using a Record causes
  //       invalid types with circular dependencies. This is functionally the same.
  // Ref: https://github.com/hey-api/openapi-ts/issues/370
  const node = createTypeInterfaceNode({
    properties: [
      {
        name: `[key: ${tsNodeToString({ node: keyNode, unescape: true })}]`,
        type: valueNode,
      },
    ],
  });
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
  const node = createTypeReferenceNode({
    typeArguments: [createTypeUnionNode({ types })],
    typeName: 'Array',
  });
  return maybeNullable({ isNullable, node });
};
