import ts from 'typescript';

import { createTypeNode } from './typedef';
import {
  addLeadingComments,
  type Comments,
  createIdentifier,
  isTsNode,
  isType,
  ots,
} from './utils';

export type AccessLevel = 'public' | 'protected' | 'private';

export type FunctionParameter =
  | {
      accessLevel?: AccessLevel;
      default?: any;
      isReadOnly?: boolean;
      isRequired?: boolean;
      name: string;
      type?: any | ts.TypeNode;
    }
  | {
      destructure: FunctionParameter[];
    };

export interface FunctionTypeParameter {
  default?: any;
  extends?: any | ts.TypeNode;
  name: string;
}

export const createPropertyAccessExpression = ({
  expression,
  name,
}: {
  expression: string | ts.Expression;
  name: string | ts.MemberName;
}) => {
  const node = ts.factory.createPropertyAccessExpression(
    typeof expression === 'string'
      ? createIdentifier({ text: expression })
      : expression,
    typeof name === 'string' ? createIdentifier({ text: name }) : name,
  );
  return node;
};

/**
 * Convert an unknown value to an expression.
 * @param identifiers - list of keys that are treated as identifiers.
 * @param shorthand - if shorthand syntax is allowed.
 * @param unescape - if string should be unescaped.
 * @param value - the unknown value.
 * @returns ts.Expression
 */
export const toExpression = <T = unknown>({
  identifiers = [],
  isValueAccess,
  shorthand,
  unescape,
  value,
}: {
  identifiers?: string[];
  isValueAccess?: boolean;
  shorthand?: boolean;
  unescape?: boolean;
  value: T;
}): ts.Expression | undefined => {
  if (value === null) {
    return ts.factory.createNull();
  }

  if (Array.isArray(value)) {
    return createArrayLiteralExpression({ elements: value });
  }

  if (typeof value === 'object') {
    return createObjectType({
      identifiers,
      obj: value,
      shorthand,
    });
  }

  if (typeof value === 'number') {
    return ots.number(value);
  }

  if (typeof value === 'boolean') {
    return ots.boolean(value);
  }

  if (typeof value === 'string') {
    if (isValueAccess) {
      // TODO; handle more than single nested level, i.e. foo.bar.baz
      const parts = value.split('.');
      return createPropertyAccessExpression({
        expression: parts[0],
        name: parts[1],
      });
    }
    return ots.string(value, unescape);
  }
};

/**
 * Convert AccessLevel to proper TypeScript compiler API modifier.
 * @param access - the access level.
 * @returns ts.ModifierLike[]
 */
export const toAccessLevelModifiers = (
  access?: AccessLevel,
): ts.ModifierLike[] => {
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
export const toParameterDeclarations = (parameters: FunctionParameter[]) =>
  parameters.map((parameter) => {
    if ('destructure' in parameter) {
      return ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createObjectBindingPattern(
          parameter.destructure
            .map((param) => {
              // TODO: add support for nested destructuring, not needed at the moment
              if ('destructure' in param) {
                return;
              }

              const result = ts.factory.createBindingElement(
                undefined,
                undefined,
                createIdentifier({ text: param.name }),
                undefined,
              );
              return result;
            })
            .filter(Boolean) as ts.BindingElement[],
        ),
        undefined,
        undefined,
        undefined,
      );
    }

    let modifiers = toAccessLevelModifiers(parameter.accessLevel);

    if (parameter.isReadOnly) {
      modifiers = [
        ...modifiers,
        ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
      ];
    }

    return ts.factory.createParameterDeclaration(
      modifiers,
      undefined,
      createIdentifier({ text: parameter.name }),
      parameter.isRequired !== undefined && !parameter.isRequired
        ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
        : undefined,
      parameter.type !== undefined ? createTypeNode(parameter.type) : undefined,
      parameter.default !== undefined
        ? toExpression({ value: parameter.default })
        : undefined,
    );
  });

export const createKeywordTypeNode = ({
  keyword,
}: {
  keyword: 'any' | 'boolean' | 'string';
}) => {
  let kind: ts.KeywordTypeSyntaxKind = ts.SyntaxKind.AnyKeyword;
  switch (keyword) {
    case 'boolean':
      kind = ts.SyntaxKind.BooleanKeyword;
      break;
    case 'string':
      kind = ts.SyntaxKind.StringKeyword;
      break;
  }
  return ts.factory.createKeywordTypeNode(kind);
};

export const toTypeParameters = (types: FunctionTypeParameter[]) =>
  types.map((type) =>
    ts.factory.createTypeParameterDeclaration(
      undefined,
      type.name,
      // TODO: support other extends values
      type.extends ? createKeywordTypeNode({ keyword: 'boolean' }) : undefined,
      // TODO: support other default types
      type.default !== undefined
        ? ts.factory.createLiteralTypeNode(
            type.default ? ts.factory.createTrue() : ts.factory.createFalse(),
          )
        : undefined,
    ),
  );

/**
 * Create arrow function type expression.
 */
export const createArrowFunction = ({
  async,
  comment,
  multiLine,
  parameters = [],
  returnType,
  statements = [],
  types = [],
}: {
  async?: boolean;
  comment?: Comments;
  multiLine?: boolean;
  parameters?: FunctionParameter[];
  returnType?: string | ts.TypeNode;
  statements?: ts.Statement[] | ts.Expression;
  types?: FunctionTypeParameter[];
}) => {
  const expression = ts.factory.createArrowFunction(
    async ? [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
    types ? toTypeParameters(types) : undefined,
    toParameterDeclarations(parameters),
    returnType ? createTypeNode(returnType) : undefined,
    undefined,
    Array.isArray(statements)
      ? ts.factory.createBlock(statements, multiLine)
      : statements,
  );

  addLeadingComments({
    comments: comment,
    node: expression,
  });

  return expression;
};

/**
 * Create Array type expression.
 * @param arr - The array to create.
 * @param multiLine - if the array should be multiline.
 * @returns ts.ArrayLiteralExpression
 */
export const createArrayLiteralExpression = <T>({
  elements,
  multiLine = false,
}: {
  elements: T[];
  multiLine?: boolean;
}): ts.ArrayLiteralExpression => {
  const expression = ts.factory.createArrayLiteralExpression(
    elements
      .map((value) => (isTsNode(value) ? value : toExpression({ value })))
      .filter(isType<ts.Expression>),
    // multiline if array contains objects
    multiLine ||
      (!Array.isArray(elements[0]) && typeof elements[0] === 'object'),
  );
  return expression;
};

export const createAwaitExpression = ({
  expression,
}: {
  expression: ts.Expression;
}) => ts.factory.createAwaitExpression(expression);

export type ObjectValue =
  | {
      comments?: Comments;
      spread: string;
    }
  | {
      comments?: Comments;
      isValueAccess?: boolean;
      key: string;
      value: any;
    };

type ObjectAssignment =
  | ts.PropertyAssignment
  | ts.ShorthandPropertyAssignment
  | ts.SpreadAssignment;

/**
 * Create Object type expression.
 * @param comments - comments to add to each property.
 * @param identifier - keys that should be treated as identifiers.
 * @param multiLine - if the object should be multiline.
 * @param obj - the object to create expression with.
 * @param shorthand - if shorthand syntax should be used.
 * @param unescape - if properties strings should be unescaped.
 * @returns ts.ObjectLiteralExpression
 */
export const createObjectType = <
  T extends Record<string, any> | Array<ObjectValue>,
>({
  comments,
  identifiers = [],
  multiLine = true,
  obj,
  shorthand = false,
  unescape = false,
}: {
  comments?: Comments;
  identifiers?: string[];
  multiLine?: boolean;
  obj: T;
  shorthand?: boolean;
  unescape?: boolean;
}): ts.ObjectLiteralExpression => {
  const properties = Array.isArray(obj)
    ? obj
        .map((value: ObjectValue) => {
          // Check key value equality before possibly modifying it
          let canShorthand = false;
          if ('key' in value) {
            let { key } = value;
            canShorthand = key === value.value;
            if (
              key.match(/^[0-9]/) &&
              key.match(/\D+/g) &&
              !key.startsWith("'") &&
              !key.endsWith("'")
            ) {
              key = `'${key}'`;
            }
            if (
              key.match(/\W/g) &&
              !key.startsWith("'") &&
              !key.endsWith("'")
            ) {
              key = `'${key}'`;
            }
          }
          let assignment: ObjectAssignment;
          if ('spread' in value) {
            assignment = ts.factory.createSpreadAssignment(
              createIdentifier({ text: value.spread }),
            );
          } else if (shorthand && canShorthand) {
            assignment = ts.factory.createShorthandPropertyAssignment(
              value.value,
            );
          } else {
            let initializer: ts.Expression | undefined = isTsNode(value.value)
              ? value.value
              : toExpression({
                  identifiers: identifiers.includes(value.key)
                    ? Object.keys(value.value)
                    : [],
                  isValueAccess: value.isValueAccess,
                  shorthand,
                  unescape,
                  value: value.value,
                });
            if (!initializer) {
              return undefined;
            }
            // Create a identifier if the current key is one and it is not an object
            if (
              identifiers.includes(value.key) &&
              !ts.isObjectLiteralExpression(initializer)
            ) {
              initializer = createIdentifier({ text: value.value as string });
            }
            assignment = ts.factory.createPropertyAssignment(
              value.key,
              initializer,
            );
          }

          addLeadingComments({
            comments: value.comments,
            node: assignment,
          });

          return assignment;
        })
        .filter(isType<ObjectAssignment>)
    : Object.entries(obj)
        .map(([key, value]) => {
          // Pass all object properties as identifiers if the whole object is an identifier
          let initializer: ts.Expression | undefined = toExpression({
            identifiers: identifiers.includes(key) ? Object.keys(value) : [],
            shorthand,
            unescape,
            value,
          });
          if (!initializer) {
            return undefined;
          }
          // Create a identifier if the current key is one and it is not an object
          if (
            identifiers.includes(key) &&
            !ts.isObjectLiteralExpression(initializer)
          ) {
            initializer = createIdentifier({ text: value as string });
          }
          // Check key value equality before possibly modifying it
          const canShorthand = key === value;
          if (
            key.match(/^[0-9]/) &&
            key.match(/\D+/g) &&
            !key.startsWith("'") &&
            !key.endsWith("'")
          ) {
            key = `'${key}'`;
          }
          if (key.match(/\W/g) && !key.startsWith("'") && !key.endsWith("'")) {
            key = `'${key}'`;
          }
          const assignment =
            shorthand && canShorthand
              ? ts.factory.createShorthandPropertyAssignment(value)
              : ts.factory.createPropertyAssignment(key, initializer);

          // addLeadingComments({
          //   comments: comments?.[key],
          //   node: assignment,
          // });

          return assignment;
        })
        .filter(isType<ObjectAssignment>);

  const expression = ts.factory.createObjectLiteralExpression(
    properties as any[],
    multiLine,
  );

  addLeadingComments({
    comments,
    node: expression,
  });

  return expression;
};

/**
 * Create enum declaration. Example `export enum T = { X, Y };`
 * @param comments - comments to add to each property of enum.
 * @param leadingComment - leading comment to add to enum.
 * @param name - the name of the enum.
 * @param obj - the object representing the enum.
 * @returns
 */
export const createEnumDeclaration = <T extends object>({
  comments,
  leadingComment,
  name,
  obj,
}: {
  comments?: Record<string | number, Comments>;
  leadingComment?: Comments;
  name: string;
  obj: T;
}): ts.EnumDeclaration => {
  const declaration = ts.factory.createEnumDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    createIdentifier({ text: name }),
    Object.entries(obj).map(([key, value]) => {
      const initializer = toExpression({ unescape: true, value });
      const assignment = ts.factory.createEnumMember(key, initializer);
      const comment = comments?.[key];

      addLeadingComments({
        comments: comment,
        node: assignment,
      });

      return assignment;
    }),
  );

  addLeadingComments({
    comments: leadingComment,
    node: declaration,
  });

  return declaration;
};

/**
 * Create namespace declaration. Example `export namespace MyNamespace { ... }`
 * @param name - the name of the namespace.
 * @param nodes - the nodes in the namespace.
 * @returns
 */
export const createNamespaceDeclaration = <
  T extends Array<ts.EnumDeclaration>,
>({
  name,
  statements,
}: {
  name: string;
  statements: T;
}) =>
  ts.factory.createModuleDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    createIdentifier({ text: name }),
    ts.factory.createModuleBlock(statements),
    ts.NodeFlags.Namespace,
  );
