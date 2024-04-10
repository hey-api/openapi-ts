import ts from 'typescript';

import { addLeadingJSDocComment, type Comments } from './utils';

export const createTypeNode = (base: any) => ts.factory.createTypeReferenceNode(base as string);

/**
 * Create a type alias declaration. Example `export type X = Y;`.
 * @param name - the name of the type.
 * @param type - the type.
 * @param comments - comments to add if any.
 * @returns ts.TypeAliasDeclaration
 */
export const createTypeAliasDeclaration = (
    name: string,
    type: string,
    comments?: Comments
): ts.TypeAliasDeclaration => {
    const node = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(name),
        [],
        ts.factory.createTypeReferenceNode(type)
    );
    if (comments?.length) {
        addLeadingJSDocComment(node, comments);
    }
    return node;
};

// Property of a interface type node.
export type Property = {
    name: string;
    type: string | undefined;
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
export const createTypeInterfaceNode = (properties: Property[], isNullable: boolean = false) => {
    const node = ts.factory.createTypeLiteralNode(
        properties.map(property => {
            const signature = ts.factory.createPropertySignature(
                property.isReadOnly ? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)] : undefined,
                property.name,
                property.isRequired ? undefined : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createTypeReferenceNode(property.type ?? 'undefined')
            );
            const comment = property.comment;
            if (comment) {
                addLeadingJSDocComment(signature, comment);
            }
            return signature;
        })
    );
    if (!isNullable) {
        return node;
    }
    return ts.factory.createUnionTypeNode([node, ts.factory.createTypeReferenceNode('null')]);
};

/**
 * Create type union node. Example `string | number | boolean`
 * @param types - the types in the union
 * @param isNullable - if the whole type can be null
 * @returns ts.UnionTypeNode
 */
export const createTypeUnionNode = (types: unknown[], isNullable: boolean = false) => {
    const nodes = types.map(t => ts.factory.createTypeReferenceNode(t as string));
    if (isNullable) {
        nodes.push(ts.factory.createTypeReferenceNode('null'));
    }
    return ts.factory.createUnionTypeNode(nodes);
};

/**
 * Create type tuple node. Example `string, number, boolean`
 * @param types - the types in the union
 * @param isNullable - if the whole type can be null
 * @returns ts.UnionTypeNode
 */
export const createTypeTupleNode = (types: unknown[], isNullable: boolean = false) => {
    const nodes = types.map(t => ts.factory.createTypeReferenceNode(t as string));
    if (isNullable) {
        nodes.push(ts.factory.createTypeReferenceNode('null'));
    }
    return ts.factory.createTupleTypeNode(nodes);
};

/**
 * Create type record node. Example `Record<string, X | Y>`
 * @param keys - key types.
 * @param values - value types.
 * @param isNullable - if the whole type can be null
 * @returns ts.TypeReferenceNode | ts.UnionTypeNode
 */
export const createTypeRecordNode = (keys: unknown[], values: unknown[], isNullable: boolean = false) => {
    const keyNode = createTypeUnionNode(keys);
    const valueNode = createTypeUnionNode(values);
    const node = ts.factory.createTypeReferenceNode('Record', [keyNode, valueNode]);
    if (!isNullable) {
        return node;
    }
    return ts.factory.createUnionTypeNode([node, ts.factory.createTypeReferenceNode('null')]);
};

/**
 * Create type array node. Example `Array<string | number>`
 * @param types - the types
 * @param isNullable - if the whole type can be null
 * @returns ts.TypeReferenceNode | ts.UnionTypeNode
 */
export const createTypeArrayNode = (types: unknown[], isNullable: boolean = false) => {
    const node = ts.factory.createTypeReferenceNode('Array', [createTypeUnionNode(types)]);
    if (!isNullable) {
        return node;
    }
    return ts.factory.createUnionTypeNode([node, ts.factory.createTypeReferenceNode('null')]);
};
