import ts from 'typescript';

import { addLeadingJSDocComment, type Comments, isType, ots } from './utils';

/**
 * Convert an unknown value to an expression.
 * @param value - the unknown value.
 * @returns ts.Expression
 */
export const toExpression = (value: unknown, unescape = false): ts.Expression | undefined => {
    if (Array.isArray(value)) {
        return createArrayType(value);
    }

    if (typeof value === 'object' && value !== null) {
        return createObjectType(value);
    }

    if (typeof value === 'number') {
        return ots.number(value);
    }

    if (typeof value === 'boolean') {
        return ots.boolean(value);
    }

    if (typeof value === 'string') {
        return ots.string(value, unescape);
    }

    if (value === null) {
        return ts.factory.createNull();
    }
};

/**
 * Create Array type expression.
 * @param arr - The array to create.
 * @param multiLine - if the array should be multiline.
 * @returns ts.ArrayLiteralExpression
 */
export const createArrayType = <T>(arr: T[], multiLine: boolean = false): ts.ArrayLiteralExpression =>
    ts.factory.createArrayLiteralExpression(
        arr.map(v => toExpression(v)).filter(isType<ts.Expression>),
        // Multiline if the array contains objects, or if specified by the user.
        (!Array.isArray(arr[0]) && typeof arr[0] === 'object') || multiLine
    );

/**
 * Create Object type expression.
 * @param obj - the object to create.
 * @param multiLine - if the object should be multiline.
 * @returns ts.ObjectLiteralExpression
 */
export const createObjectType = <T extends object>(obj: T, multiLine: boolean = true): ts.ObjectLiteralExpression =>
    ts.factory.createObjectLiteralExpression(
        Object.entries(obj)
            .map(([key, value]) => {
                const initializer = toExpression(value);
                if (key.match(/\W/g) && !key.startsWith("'") && !key.endsWith("'")) {
                    key = `'${key}'`;
                }
                return initializer ? ts.factory.createPropertyAssignment(key, initializer) : undefined;
            })
            .filter(isType<ts.PropertyAssignment>),
        multiLine
    );

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

/**
 * Create enum declaration. Example `export enum T = { X, Y };`
 * @param name - the name of the enum.
 * @param obj - the object representing the enum.
 * @param comment - comment to add to enum.
 * @param comments - comments to add to each property of enum.
 * @returns
 */
export const createEnumDeclaration = <T extends object>(
    name: string,
    obj: T,
    comment: Comments = [],
    comments: Record<string | number, Comments> = {}
): ts.EnumDeclaration => {
    const declaration = ts.factory.createEnumDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(name),
        Object.entries(obj).map(([key, value]) => {
            const initializer = toExpression(value, true);
            const assignment = ts.factory.createEnumMember(key, initializer);
            const c = comments?.[key];
            if (c) {
                addLeadingJSDocComment(assignment, c);
            }
            return assignment;
        })
    );
    if (comment.length) {
        addLeadingJSDocComment(declaration, comment);
    }
    return declaration;
};
