import ts from 'typescript';

import { createCallExpression } from './module';
import {
  type AccessLevel,
  createBlock,
  createTypeNode,
  type FunctionParameter,
  type FunctionTypeParameter,
  toAccessLevelModifiers,
  toExpression,
  toParameterDeclarations,
  toTypeParameters,
} from './types';
import type { Comments } from './utils';
import { addLeadingComments, createIdentifier, isType } from './utils';

/**
 * Create a class constructor declaration.
 * @param accessLevel - the access level of the constructor.
 * @param comment - comment to add to function.
 * @param multiLine - if it should be multi line.
 * @param parameters - parameters for the constructor.
 * @param statements - statements to put in the constructor body.
 * @returns ts.ConstructorDeclaration
 */
export const createConstructorDeclaration = ({
  accessLevel,
  comment,
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
    createBlock({ multiLine, statements }),
  );

  addLeadingComments({
    comments: comment,
    node,
  });

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
 * @param statements - statements to put in the constructor body.
 * @returns ts.MethodDeclaration
 */
export const createMethodDeclaration = ({
  accessLevel,
  comment,
  isStatic = false,
  multiLine = true,
  name,
  parameters = [],
  returnType,
  statements = [],
  types = [],
}: {
  accessLevel?: AccessLevel;
  comment?: Comments;
  isStatic?: boolean;
  multiLine?: boolean;
  name: string;
  parameters?: ReadonlyArray<FunctionParameter>;
  returnType?: string | ts.TypeNode;
  statements?: ts.Statement[];
  types?: FunctionTypeParameter[];
}) => {
  const modifiers = toAccessLevelModifiers(accessLevel);

  if (isStatic) {
    modifiers.push(ts.factory.createModifier(ts.SyntaxKind.StaticKeyword));
  }

  const node = ts.factory.createMethodDeclaration(
    modifiers,
    undefined,
    createIdentifier({ text: name }),
    undefined,
    types ? toTypeParameters(types) : undefined,
    toParameterDeclarations(parameters),
    returnType ? createTypeNode(returnType) : undefined,
    createBlock({ multiLine, statements }),
  );

  addLeadingComments({
    comments: comment,
    node,
  });

  return node;
};

type ClassDecorator = {
  args: any[];
  name: string;
};

/**
 * Create a class declaration.
 */
export const createClassDeclaration = ({
  decorator,
  exportClass,
  name,
  nodes,
}: {
  /**
   * Class decorator.
   */
  decorator?: ClassDecorator;
  /**
   * @default false
   */
  exportClass?: boolean;
  /**
   * Class name.
   */
  name: string;
  /**
   * Class elements.
   */
  nodes: ReadonlyArray<ts.ClassElement>;
}): ts.ClassDeclaration => {
  const modifiers: Array<ts.ModifierLike> = [];

  if (exportClass) {
    modifiers.push(ts.factory.createModifier(ts.SyntaxKind.ExportKeyword));
  }

  if (decorator) {
    modifiers.unshift(
      ts.factory.createDecorator(
        createCallExpression({
          functionName: decorator.name,
          parameters: decorator.args
            .map((arg) => toExpression({ value: arg }))
            .filter(isType<ts.Expression>),
        }),
      ),
    );
  }

  return ts.factory.createClassDeclaration(
    modifiers,
    createIdentifier({ text: name }),
    undefined,
    undefined,
    nodes,
  );
};
