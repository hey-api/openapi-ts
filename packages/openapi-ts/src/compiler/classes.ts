import ts from 'typescript';

import { createTypeNode } from './typedef';
import { toExpression } from './types';
import { addLeadingComment, Comments, isType } from './utils';

type AccessLevel = 'public' | 'protected' | 'private';

export type FunctionParameter = {
    accessLevel?: AccessLevel;
    default?: any;
    isReadOnly?: boolean;
    isRequired?: boolean;
    name: string;
    type: any | ts.TypeNode;
};

/**
 * Convert AccessLevel to proper TypeScript compiler API modifier.
 * @param access - the access level.
 * @returns ts.ModifierLike[]
 */
const toAccessLevelModifiers = (access?: AccessLevel): ts.ModifierLike[] => {
    const keyword =
        access === 'public'
            ? ts.SyntaxKind.PublicKeyword
            : access === 'protected'
              ? ts.SyntaxKind.ProtectedKeyword
              : access === 'private'
                ? ts.SyntaxKind.PrivateKeyword
                : undefined;
    const modifiers: ts.ModifierLike[] = [];
    if (keyword) {
        modifiers.push(ts.factory.createModifier(keyword));
    }
    return modifiers;
};

/**
 * Convert parameters to the declaration array expected by compiler API.
 * @param parameters - the parameters to conver to declarations
 * @returns ts.ParameterDeclaration[]
 */
const toParameterDeclarations = (parameters: FunctionParameter[]) =>
    parameters.map(p => {
        const modifiers = toAccessLevelModifiers(p.accessLevel);
        if (p.isReadOnly) {
            modifiers.push(ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword));
        }
        return ts.factory.createParameterDeclaration(
            modifiers,
            undefined,
            ts.factory.createIdentifier(p.name),
            p.isRequired !== undefined && !p.isRequired
                ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                : undefined,
            p.type !== undefined ? createTypeNode(p.type) : undefined,
            p.default !== undefined ? toExpression({ value: p.default }) : undefined
        );
    });

/**
 * Create a class constructor declaration.
 * @param accessLevel - the access level of the constructor.
 * @param comment - comment to add to function.
 * @param multiLine - if it should be multi line.
 * @param parameters - parameters for the constructor.
 * @param statements - statements to put in the contructor body.
 * @returns ts.ConstructorDeclaration
 */
export const createConstructorDeclaration = ({
    accessLevel = undefined,
    comment = undefined,
    multiLine = true,
    parameters = [],
    statements = [],
}: {
    accessLevel?: AccessLevel;
    comment?: Comments;
    multiLine?: boolean;
    parameters?: FunctionParameter[];
    statements?: ts.Statement[];
}) => {
    const node = ts.factory.createConstructorDeclaration(
        toAccessLevelModifiers(accessLevel),
        toParameterDeclarations(parameters),
        ts.factory.createBlock(statements, multiLine)
    );
    if (comment?.length) {
        addLeadingComment(node, comment);
    }
    return node;
};

/**
 * Create a class method declaration.
 * @param accessLevel - the access level of the method.
 * @param comment - comment to add to function.
 * @param isStatic - if the function is static.
 * @param multiLine - if it should be multi line.
 * @param name - name of the method.
 * @param parameters - parameters for the method.
 * @param returnType - the return type of the method.
 * @param statements - statements to put in the contructor body.
 * @returns ts.MethodDeclaration
 */
export const createMethodDeclaration = ({
    accessLevel = undefined,
    comment = undefined,
    isStatic = false,
    multiLine = true,
    name,
    parameters = [],
    returnType = undefined,
    statements = [],
}: {
    accessLevel?: AccessLevel;
    comment?: Comments;
    isStatic?: boolean;
    multiLine?: boolean;
    name: string;
    parameters?: FunctionParameter[];
    returnType?: string | ts.TypeNode;
    statements?: ts.Statement[];
}) => {
    const modifiers = toAccessLevelModifiers(accessLevel);
    if (isStatic) {
        modifiers.push(ts.factory.createModifier(ts.SyntaxKind.StaticKeyword));
    }
    const node = ts.factory.createMethodDeclaration(
        modifiers,
        undefined,
        ts.factory.createIdentifier(name),
        undefined,
        [],
        toParameterDeclarations(parameters),
        returnType ? createTypeNode(returnType) : undefined,
        ts.factory.createBlock(statements, multiLine)
    );
    if (comment?.length) {
        addLeadingComment(node, comment);
    }
    return node;
};

type ClassDecorator = {
    name: string;
    args: any[];
};

/**
 * Create a class declaration.
 * @param decorator - the class decorator
 * @param members - elements in the class.
 * @param name - name of the class.
 * @returns ts.ClassDeclaration
 */
export const createClassDeclaration = ({
    decorator = undefined,
    members = [],
    name,
}: {
    decorator?: ClassDecorator;
    members?: ts.ClassElement[];
    name: string;
}) => {
    const modifiers: ts.ModifierLike[] = [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)];
    if (decorator) {
        modifiers.unshift(
            ts.factory.createDecorator(
                ts.factory.createCallExpression(
                    ts.factory.createIdentifier(decorator.name),
                    undefined,
                    decorator.args.map(arg => toExpression({ value: arg })).filter(isType<ts.Expression>)
                )
            )
        );
    }
    // Add newline between each class member.
    const m: ts.ClassElement[] = [];
    members.forEach(member => {
        m.push(member);
        // @ts-ignore
        m.push(ts.factory.createIdentifier('\n'));
    });
    return ts.factory.createClassDeclaration(modifiers, ts.factory.createIdentifier(name), [], [], m);
};

/**
 * Create a return function call. Example `return call(param);`.
 * @param args - arguments to pass to the function.
 * @param name - name of the function to call.
 * @returns ts.ReturnStatement
 */
export const createReturnFunctionCall = ({ args = [], name }: { args: any[]; name: string }) =>
    ts.factory.createReturnStatement(
        ts.factory.createCallExpression(
            ts.factory.createIdentifier(name),
            undefined,
            args.map(arg => ts.factory.createIdentifier(arg)).filter(isType<ts.Identifier>)
        )
    );
