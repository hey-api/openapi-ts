import ts from 'typescript';

import { createTypeNode } from './typedef';
import { addLeadingJSDocComment, type Comments, isType, ots } from './utils';

export type AccessLevel = 'public' | 'protected' | 'private';

export type FunctionParameter = {
  accessLevel?: AccessLevel;
  default?: any;
  isReadOnly?: boolean;
  isRequired?: boolean;
  name: string;
  type?: any | ts.TypeNode;
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
  shorthand = false,
  unescape = false,
  value,
}: {
  identifiers?: string[];
  shorthand?: boolean;
  unescape?: boolean;
  value: T;
}): ts.Expression | undefined => {
  if (value === null) {
    return ts.factory.createNull();
  }

  if (Array.isArray(value)) {
    return createArrayType({ arr: value });
  }

  if (typeof value === 'object') {
    return createObjectType({ identifiers, obj: value, shorthand });
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
  parameters.map((p) => {
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
      p.default !== undefined ? toExpression({ value: p.default }) : undefined,
    );
  });

/**
 * Create Function type expression.
 */
export const createFunction = ({
  async,
  comment,
  multiLine,
  parameters = [],
  returnType,
  statements = [],
}: {
  async?: boolean;
  comment?: Comments;
  multiLine?: boolean;
  parameters?: FunctionParameter[];
  returnType?: string | ts.TypeNode;
  statements?: ts.Statement[];
}) => {
  const expression = ts.factory.createArrowFunction(
    async ? [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
    undefined,
    toParameterDeclarations(parameters),
    returnType ? createTypeNode(returnType) : undefined,
    undefined,
    ts.factory.createBlock(statements, multiLine),
  );
  if (comment) {
    addLeadingJSDocComment(expression, comment);
  }
  return expression;
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
    arr.map((value) => toExpression({ value })).filter(isType<ts.Expression>),
    // Multiline if the array contains objects, or if specified by the user.
    (!Array.isArray(arr[0]) && typeof arr[0] === 'object') || multiLine,
  );

export type ObjectValue =
  | { spread: string }
  | {
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
  leadingComment,
  multiLine = true,
  obj,
  shorthand = false,
  unescape = false,
}: {
  comments?: Record<string | number, Comments>;
  identifiers?: string[];
  leadingComment?: Comments;
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
              ts.factory.createIdentifier(value.spread),
            );
          } else if (shorthand && canShorthand) {
            assignment = ts.factory.createShorthandPropertyAssignment(
              value.value,
            );
          } else {
            let initializer: ts.Expression | undefined = toExpression({
              identifiers: identifiers.includes(value.key)
                ? Object.keys(value.value)
                : [],
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
              initializer = ts.factory.createIdentifier(value.value as string);
            }
            assignment = ts.factory.createPropertyAssignment(
              value.key,
              initializer,
            );
          }
          if ('key' in value) {
            const comment = comments?.[value.key];
            if (comment) {
              addLeadingJSDocComment(assignment, comment);
            }
          }
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
            initializer = ts.factory.createIdentifier(value as string);
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
          const comment = comments?.[key];
          if (comment) {
            addLeadingJSDocComment(assignment, comment);
          }
          return assignment;
        })
        .filter(isType<ObjectAssignment>);

  const expression = ts.factory.createObjectLiteralExpression(
    properties as any[],
    multiLine,
  );

  if (leadingComment) {
    addLeadingJSDocComment(expression, leadingComment);
  }

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
    ts.factory.createIdentifier(name),
    Object.entries(obj).map(([key, value]) => {
      const initializer = toExpression({ unescape: true, value });
      const assignment = ts.factory.createEnumMember(key, initializer);
      const comment = comments?.[key];
      if (comment) {
        addLeadingJSDocComment(assignment, comment);
      }
      return assignment;
    }),
  );
  if (leadingComment) {
    addLeadingJSDocComment(declaration, leadingComment);
  }
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
    ts.factory.createIdentifier(name),
    ts.factory.createModuleBlock(statements),
    ts.NodeFlags.Namespace,
  );
