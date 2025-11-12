import ts from 'typescript';

import { createCallExpression } from './module';
import {
  type AccessLevel,
  createBlock,
  createTypeNode,
  type FunctionParameter,
  type FunctionTypeParameter,
  toExpression,
  toParameterDeclarations,
  toTypeParameters,
} from './types';
import type { Comments } from './utils';
import {
  addLeadingComments,
  createIdentifier,
  createModifier,
  isType,
} from './utils';

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
  const modifiers = accessLevel
    ? [createModifier({ keyword: accessLevel })]
    : undefined;
  const node = ts.factory.createConstructorDeclaration(
    modifiers,
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
 * @param isAsync - if the function is async.
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
  isAsync = false,
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
  isAsync?: boolean;
  isStatic?: boolean;
  multiLine?: boolean;
  name: string;
  parameters?: ReadonlyArray<FunctionParameter>;
  returnType?: string | ts.TypeNode;
  statements?: ts.Statement[];
  types?: FunctionTypeParameter[];
}) => {
  const modifiers = accessLevel
    ? [createModifier({ keyword: accessLevel })]
    : [];

  if (isAsync) {
    modifiers.push(createModifier({ keyword: 'async' }));
  }

  if (isStatic) {
    modifiers.push(createModifier({ keyword: 'static' }));
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
  extendedClasses,
  name,
  nodes,
  typeParameters,
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
   * List of extended classes.
   */
  extendedClasses?: ReadonlyArray<string>;
  /**
   * Class name.
   */
  name: string;
  /**
   * Class elements.
   */
  nodes: ReadonlyArray<ts.ClassElement>;
  typeParameters?: ReadonlyArray<ts.TypeParameterDeclaration>;
}): ts.ClassDeclaration => {
  const modifiers: Array<ts.ModifierLike> = [];

  if (exportClass) {
    modifiers.push(createModifier({ keyword: 'export' }));
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

  const heritageClauses: Array<ts.HeritageClause> = [];

  if (extendedClasses) {
    for (const extendedClass of extendedClasses) {
      heritageClauses.push(
        ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
          ts.factory.createExpressionWithTypeArguments(
            createIdentifier({ text: extendedClass }),
            undefined,
          ),
        ]),
      );
    }
  }

  return ts.factory.createClassDeclaration(
    modifiers,
    createIdentifier({ text: name }),
    typeParameters,
    heritageClauses,
    nodes,
  );
};
