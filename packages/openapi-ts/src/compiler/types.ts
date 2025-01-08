import ts from 'typescript';

import { escapeName } from '../utils/escape';
import { validTypescriptIdentifierRegExp } from '../utils/regexp';
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
  extends?: string | ts.TypeNode;
  name: string | ts.Identifier;
}

export const createTypeNode = (
  base: any | ts.TypeNode,
  args?: (any | ts.TypeNode)[],
): ts.TypeNode => {
  if (ts.isTypeNode(base)) {
    return base;
  }

  if (typeof base === 'number') {
    return ts.factory.createLiteralTypeNode(ots.number(base));
  }

  return createTypeReferenceNode({
    typeArguments: args?.map((arg) => createTypeNode(arg)),
    typeName: base,
  });
};

export const createPropertyAccessChain = ({
  expression,
  name,
}: {
  expression: ts.Expression;
  name: string | ts.MemberName;
}) => {
  const node = ts.factory.createPropertyAccessChain(
    expression,
    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
    name,
  );
  return node;
};

export const createPropertyAccessExpression = ({
  expression,
  isOptional,
  name,
}: {
  expression: string | ts.Expression;
  isOptional?: boolean;
  name: string | ts.MemberName;
}):
  | ts.PropertyAccessChain
  | ts.PropertyAccessExpression
  | ts.ElementAccessExpression => {
  const nodeExpression =
    typeof expression === 'string'
      ? createIdentifier({ text: expression })
      : expression;

  if (isOptional) {
    return createPropertyAccessChain({
      expression: nodeExpression,
      name,
    });
  }

  if (typeof name === 'string') {
    validTypescriptIdentifierRegExp.lastIndex = 0;
    if (!validTypescriptIdentifierRegExp.test(name)) {
      // TODO: parser - this should escape name only for new parser
      if (!name.startsWith("'") && !name.endsWith("'")) {
        // eslint-disable-next-line no-useless-escape
        name = `\'${name}\'`;
      }
      const nodeName = createIdentifier({ text: name });
      return ts.factory.createElementAccessExpression(nodeExpression, nodeName);
    }
  }

  const nodeName =
    typeof name === 'string' ? createIdentifier({ text: name }) : name;

  return ts.factory.createPropertyAccessExpression(nodeExpression, nodeName);
};

export const createNull = (): ts.NullLiteral => ts.factory.createNull();

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
    return createNull();
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
        expression: parts[0]!,
        name: parts[1]!,
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
 * @param parameters - the parameters to convert to declarations
 * @returns ts.ParameterDeclaration[]
 */
export const toParameterDeclarations = (parameters: FunctionParameter[]) =>
  parameters.map((parameter) => {
    if ('destructure' in parameter) {
      return createParameterDeclaration({
        name: ts.factory.createObjectBindingPattern(
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
      });
    }

    let modifiers = toAccessLevelModifiers(parameter.accessLevel);

    if (parameter.isReadOnly) {
      modifiers = [
        ...modifiers,
        ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
      ];
    }

    return createParameterDeclaration({
      initializer:
        parameter.default !== undefined
          ? toExpression({ value: parameter.default })
          : undefined,
      modifiers,
      name: createIdentifier({ text: parameter.name }),
      required: parameter.isRequired !== false,
      type:
        parameter.type !== undefined
          ? createTypeNode(parameter.type)
          : undefined,
    });
  });

export const createKeywordTypeNode = ({
  keyword,
}: {
  keyword:
    | 'any'
    | 'boolean'
    | 'never'
    | 'number'
    | 'string'
    | 'undefined'
    | 'unknown'
    | 'void';
}) => {
  let kind: ts.KeywordTypeSyntaxKind = ts.SyntaxKind.AnyKeyword;
  switch (keyword) {
    case 'boolean':
      kind = ts.SyntaxKind.BooleanKeyword;
      break;
    case 'never':
      kind = ts.SyntaxKind.NeverKeyword;
      break;
    case 'number':
      kind = ts.SyntaxKind.NumberKeyword;
      break;
    case 'string':
      kind = ts.SyntaxKind.StringKeyword;
      break;
    case 'undefined':
      kind = ts.SyntaxKind.UndefinedKeyword;
      break;
    case 'unknown':
      kind = ts.SyntaxKind.UnknownKeyword;
      break;
    case 'void':
      kind = ts.SyntaxKind.VoidKeyword;
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
      type.extends
        ? typeof type.extends === 'string'
          ? createKeywordTypeNode({ keyword: 'boolean' })
          : type.extends
        : undefined,
      // TODO: support other default types
      type.default !== undefined
        ? isTsNode(type.default)
          ? (type.default as unknown as ts.TypeNode)
          : ts.factory.createLiteralTypeNode(
              type.default ? ts.factory.createTrue() : ts.factory.createFalse(),
            )
        : undefined,
    ),
  );

export const createLiteralTypeNode = ({
  literal,
}: {
  literal: ts.LiteralTypeNode['literal'];
}) => {
  const node = ts.factory.createLiteralTypeNode(literal);
  return node;
};

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
      ? createBlock({ multiLine, statements })
      : statements,
  );

  addLeadingComments({
    comments: comment,
    node: expression,
  });

  return expression;
};

/**
 * Create anonymous function type expression.
 */
export const createAnonymousFunction = ({
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
  statements?: ts.Statement[];
  types?: FunctionTypeParameter[];
}) => {
  const expression = ts.factory.createFunctionExpression(
    async ? [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
    undefined,
    undefined,
    types ? toTypeParameters(types) : undefined,
    toParameterDeclarations(parameters),
    returnType ? createTypeNode(returnType) : undefined,
    createBlock({ multiLine, statements }),
  );

  addLeadingComments({
    comments: comment,
    node: expression,
  });

  return expression;
};

/**
 * Create Array type expression.
 */
export const createArrayLiteralExpression = <T>({
  elements,
  multiLine = false,
}: {
  /**
   * The array to create.
   */
  elements: T[];
  /**
   * Should the array be multi line?
   *
   * @default false
   */
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

export const createFunctionTypeNode = ({
  parameters = [],
  returnType,
  typeParameters,
}: {
  parameters?: ts.ParameterDeclaration[];
  returnType: ts.TypeNode;
  typeParameters?: ts.TypeParameterDeclaration[];
}) => {
  const node = ts.factory.createFunctionTypeNode(
    typeParameters,
    parameters,
    returnType,
  );
  return node;
};

export type ObjectValue =
  | {
      assertion?: 'any' | ts.TypeNode;
      comments?: Comments;
      spread: string;
    }
  | {
      comments?: Comments;
      isValueAccess?: boolean;
      key: string;
      shorthand?: boolean;
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
  shorthand,
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
            const { key } = value;
            canShorthand = key === value.value;
            const firstDigitAndNonDigits =
              key.match(/^[0-9]/) && key.match(/\D+/g);
            if (
              (firstDigitAndNonDigits || key.match(/\W/g) || key === '') &&
              !key.startsWith("'") &&
              !key.endsWith("'")
            ) {
              value.key = `'${key}'`;
            }
          }
          let assignment: ObjectAssignment;
          if ('spread' in value) {
            const nameIdentifier = isTsNode(value.spread)
              ? value.spread
              : createIdentifier({ text: value.spread });
            assignment = ts.factory.createSpreadAssignment(
              value.assertion
                ? createAsExpression({
                    expression: nameIdentifier,
                    type:
                      typeof value.assertion === 'string'
                        ? createKeywordTypeNode({ keyword: value.assertion })
                        : value.assertion,
                  })
                : nameIdentifier,
            );
          } else if (value.shorthand || (shorthand && canShorthand)) {
            assignment = ts.factory.createShorthandPropertyAssignment(
              value.value,
            );
          } else {
            let initializer: ts.Expression | undefined = isTsNode(value.value)
              ? value.value
              : Array.isArray(value.value)
                ? createObjectType({
                    multiLine,
                    obj: value.value,
                    shorthand,
                    unescape,
                  })
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
            assignment = createPropertyAssignment({
              initializer,
              name: value.key,
            });
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
              : createPropertyAssignment({ initializer, name: key });

          return assignment;
        })
        .filter(isType<ObjectAssignment>);

  const node = ts.factory.createObjectLiteralExpression(
    properties as any[],
    multiLine,
  );

  addLeadingComments({
    comments,
    node,
  });

  return node;
};

/**
 * Create enum declaration. Example `export enum T = { X, Y };`
 * @param comments - comments to add to each property.
 * @param leadingComment - leading comment to add to enum.
 * @param name - the name of the enum.
 * @param obj - the object representing the enum.
 * @returns ts.EnumDeclaration
 */
export const createEnumDeclaration = <
  T extends Record<string, any> | Array<ObjectValue>,
>({
  comments: enumMemberComments = {},
  leadingComment: comments,
  name,
  obj,
}: {
  comments?: Record<string | number, Comments>;
  leadingComment?: Comments;
  name: string;
  obj: T;
}): ts.EnumDeclaration => {
  const members: Array<ts.EnumMember> = Array.isArray(obj)
    ? obj.map((value) => {
        const enumMember = createEnumMember({
          initializer: toExpression({
            value: value.value,
          }),
          name: value.key,
        });

        addLeadingComments({
          comments: value.comments,
          node: enumMember,
        });

        return enumMember;
      })
    : // TODO: parser - deprecate object syntax
      Object.entries(obj).map(([key, value]) => {
        const enumMember = ts.factory.createEnumMember(
          key,
          toExpression({
            unescape: true,
            value,
          }),
        );

        addLeadingComments({
          comments: enumMemberComments[key],
          node: enumMember,
        });

        return enumMember;
      });

  const node = ts.factory.createEnumDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    createIdentifier({ text: name }),
    members,
  );

  addLeadingComments({
    comments,
    node,
  });

  return node;
};

const createEnumMember = ({
  initializer,
  name,
}: {
  initializer?: ts.Expression;
  name: string | ts.PropertyName;
}) => {
  let key = name;
  if (typeof key === 'string') {
    if (key.startsWith("'") && key.endsWith("'")) {
      key = createStringLiteral({
        isSingleQuote: false,
        text: key,
      });
    } else {
      key = escapeName(key);
    }
  }
  return ts.factory.createEnumMember(key, initializer);
};

/**
 * Create namespace declaration. Example `export namespace MyNamespace { ... }`
 * @param name - the name of the namespace.
 * @param nodes - the nodes in the namespace.
 * @returns
 */
export const createNamespaceDeclaration = ({
  name,
  statements,
}: {
  name: string;
  statements: Array<ts.Statement>;
}) =>
  ts.factory.createModuleDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    createIdentifier({ text: name }),
    ts.factory.createModuleBlock(statements),
    ts.NodeFlags.Namespace,
  );

export const createIndexedAccessTypeNode = ({
  indexType,
  objectType,
}: {
  indexType: ts.TypeNode;
  objectType: ts.TypeNode;
}) => {
  const node = ts.factory.createIndexedAccessTypeNode(objectType, indexType);
  return node;
};

export const createStringLiteral = ({
  isSingleQuote,
  text,
}: {
  isSingleQuote?: boolean;
  text: string;
}) => {
  if (isSingleQuote === undefined) {
    isSingleQuote = !text.includes("'");
  }
  const node = ts.factory.createStringLiteral(text, isSingleQuote);
  return node;
};

export const createConditionalExpression = ({
  condition,
  whenFalse,
  whenTrue,
}: {
  condition: ts.Expression;
  whenFalse: ts.Expression;
  whenTrue: ts.Expression;
}) => {
  const expression = ts.factory.createConditionalExpression(
    condition,
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    whenTrue,
    ts.factory.createToken(ts.SyntaxKind.ColonToken),
    whenFalse,
  );
  return expression;
};

export const createTypeOfExpression = ({ text }: { text: string }) => {
  const expression = ts.factory.createTypeOfExpression(
    createIdentifier({ text }),
  );
  return expression;
};

/**
 * Create a type alias declaration. Example `export type X = Y;`.
 * @param comment (optional) comments to add
 * @param name the name of the type
 * @param type the type
 * @returns ts.TypeAliasDeclaration
 */
export const createTypeAliasDeclaration = ({
  comment,
  exportType,
  name,
  type,
  typeParameters = [],
}: {
  comment?: Comments;
  exportType?: boolean;
  name: string;
  type: string | ts.TypeNode;
  typeParameters?: FunctionTypeParameter[];
}): ts.TypeAliasDeclaration => {
  const node = ts.factory.createTypeAliasDeclaration(
    exportType
      ? [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)]
      : undefined,
    createIdentifier({ text: name }),
    toTypeParameters(typeParameters),
    createTypeNode(type),
  );

  addLeadingComments({
    comments: comment,
    node,
  });

  return node;
};

export const createTypeReferenceNode = ({
  typeArguments,
  typeName,
}: {
  typeArguments?: ts.TypeNode[];
  typeName: string | ts.EntityName;
}) => {
  const node = ts.factory.createTypeReferenceNode(typeName, typeArguments);
  return node;
};

export const createTypeParenthesizedNode = ({
  type,
}: {
  type: ts.TypeNode;
}) => {
  const node = ts.factory.createParenthesizedType(type);
  return node;
};

export const createParameterDeclaration = ({
  initializer,
  modifiers,
  name,
  required = true,
  type,
}: {
  initializer?: ts.Expression;
  modifiers?: ts.ModifierLike[];
  name: string | ts.BindingName;
  required?: boolean;
  type?: ts.TypeNode;
}) => {
  const node = ts.factory.createParameterDeclaration(
    modifiers,
    undefined,
    name,
    required ? undefined : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    type,
    initializer,
  );
  return node;
};

export const createNewExpression = ({
  argumentsArray,
  expression,
  typeArguments,
}: {
  argumentsArray?: Array<ts.Expression>;
  expression: ts.Expression;
  typeArguments?: Array<ts.TypeNode>;
}) => {
  const node = ts.factory.createNewExpression(
    expression,
    typeArguments,
    argumentsArray,
  );
  return node;
};

export const createForOfStatement = ({
  awaitModifier,
  expression,
  initializer,
  statement,
}: {
  // TODO: parser - simplify this to be await?: boolean
  awaitModifier?: ts.AwaitKeyword;
  expression: ts.Expression;
  initializer: ts.ForInitializer;
  statement: ts.Statement;
}) => {
  const node = ts.factory.createForOfStatement(
    awaitModifier,
    initializer,
    expression,
    statement,
  );
  return node;
};

export const createAssignment = ({
  left,
  right,
}: {
  left: ts.Expression;
  right: ts.Expression;
}) => ts.factory.createAssignment(left, right);

export const createBlock = ({
  multiLine = true,
  statements,
}: {
  multiLine?: boolean;
  statements: Array<ts.Statement>;
}) => ts.factory.createBlock(statements, multiLine);

export const createPropertyAssignment = ({
  initializer,
  name,
}: {
  initializer: ts.Expression;
  name: string | ts.PropertyName;
}) => ts.factory.createPropertyAssignment(name, initializer);

export const createRegularExpressionLiteral = ({
  flags = [],
  text,
}: {
  flags?: ReadonlyArray<'g' | 'i' | 'm' | 's' | 'u' | 'y'>;
  text: string;
}) => ts.factory.createRegularExpressionLiteral(`/${text}/${flags.join('')}`);

export const createAsExpression = ({
  expression,
  type,
}: {
  expression: ts.Expression;
  type: ts.TypeNode;
}) => ts.factory.createAsExpression(expression, type);
