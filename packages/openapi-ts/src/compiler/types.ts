import ts from 'typescript';

import { addLeadingComment, type Comments, isType, ots } from './utils';

/**
 * Convert an unknown value to an expression.
 * @param value - the unknown value.
 * @returns ts.Expression
 */
export const toExpression = (value: unknown, unescape = false): ts.Expression | undefined => {
    if (Array.isArray(value)) {
        return createArrayType({ arr: value });
    }

    if (typeof value === 'object' && value !== null) {
        return createObjectType({ obj: value });
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
export const createArrayType = <T>({
    arr,
    multiLine = false,
}: {
    arr: T[];
    multiLine?: boolean;
}): ts.ArrayLiteralExpression =>
    ts.factory.createArrayLiteralExpression(
        arr.map(v => toExpression(v)).filter(isType<ts.Expression>),
        // Multiline if the array contains objects, or if specified by the user.
        (!Array.isArray(arr[0]) && typeof arr[0] === 'object') || multiLine
    );

/**
 * Create Object type expression.
 * @param options - options to use when creating type.
 * @returns ts.ObjectLiteralExpression
 */
export const createObjectType = <T extends object>({
    comments = {},
    multiLine = true,
    obj,
    unescape = false,
}: {
    obj: T;
    multiLine?: boolean;
    unescape?: boolean;
    comments?: Record<string | number, Comments>;
}): ts.ObjectLiteralExpression => {
    const properties = Object.entries(obj)
        .map(([key, value]) => {
            const initializer = toExpression(value, unescape);
            if (!initializer) {
                return undefined;
            }
            if (key.match(/\W/g) && !key.startsWith("'") && !key.endsWith("'")) {
                key = `'${key}'`;
            }
            const assignment = ts.factory.createPropertyAssignment(key, initializer);
            const c = comments?.[key];
            if (c?.length) {
                addLeadingComment(assignment, c);
            }
            return assignment;
        })
        .filter(isType<ts.PropertyAssignment>);
    const expression = ts.factory.createObjectLiteralExpression(properties, multiLine);
    return expression;
};

/**
 * Create enum declaration. Example `export enum T = { X, Y };`
 * @param name - the name of the enum.
 * @param obj - the object representing the enum.
 * @param leadingComment - leading comment to add to enum.
 * @param comments - comments to add to each property of enum.
 * @returns
 */
export const createEnumDeclaration = <T extends object>({
    name,
    obj,
    leadingComment = [],
    comments = {},
}: {
    name: string;
    obj: T;
    leadingComment: Comments;
    comments: Record<string | number, Comments>;
}): ts.EnumDeclaration => {
    const declaration = ts.factory.createEnumDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(name),
        Object.entries(obj).map(([key, value]) => {
            const initializer = toExpression(value, true);
            const assignment = ts.factory.createEnumMember(key, initializer);
            const c = comments?.[key];
            if (c) {
                addLeadingComment(assignment, c);
            }
            return assignment;
        })
    );
    if (leadingComment.length) {
        addLeadingComment(declaration, leadingComment);
    }
    return declaration;
};
