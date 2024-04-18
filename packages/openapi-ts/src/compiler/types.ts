import ts from 'typescript'

import { addLeadingComment, type Comments, isType, ots } from './utils'

/**
 * Convert an unknown value to an expression.
 * @param value - the unknown value.
 * @param unescape - if string should be unescaped.
 * @param shorthand - if shorthand syntax is allowed.
 * @param indentifier - list of keys that are treated as indentifiers.
 * @returns ts.Expression
 */
export const toExpression = <T = unknown>({
  value,
  unescape = false,
  shorthand = false,
  identifiers = []
}: {
  value: T
  unescape?: boolean
  shorthand?: boolean
  identifiers?: string[]
}): ts.Expression | undefined => {
  if (value === null) {
    return ts.factory.createNull()
  }

  if (Array.isArray(value)) {
    return createArrayType({ arr: value })
  }

  if (typeof value === 'object') {
    return createObjectType({ identifiers, obj: value, shorthand })
  }

  if (typeof value === 'number') {
    return ots.number(value)
  }

  if (typeof value === 'boolean') {
    return ots.boolean(value)
  }

  if (typeof value === 'string') {
    return ots.string(value, unescape)
  }
}

/**
 * Create Array type expression.
 * @param arr - The array to create.
 * @param multiLine - if the array should be multiline.
 * @returns ts.ArrayLiteralExpression
 */
export const createArrayType = <T>({
  arr,
  multiLine = false
}: {
  arr: T[]
  multiLine?: boolean
}): ts.ArrayLiteralExpression =>
  ts.factory.createArrayLiteralExpression(
    arr.map(value => toExpression({ value })).filter(isType<ts.Expression>),
    // Multiline if the array contains objects, or if specified by the user.
    (!Array.isArray(arr[0]) && typeof arr[0] === 'object') || multiLine
  )

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
export const createObjectType = <T extends object>({
  comments = {},
  identifiers = [],
  multiLine = true,
  obj,
  shorthand = false,
  unescape = false
}: {
  obj: T
  comments?: Record<string | number, Comments>
  identifiers?: string[]
  multiLine?: boolean
  shorthand?: boolean
  unescape?: boolean
}): ts.ObjectLiteralExpression => {
  const properties = Object.entries(obj)
    .map(([key, value]) => {
      // Pass all object properties as identifiers if the whole object is a indentifier
      let initializer: ts.Expression | undefined = toExpression({
        identifiers: identifiers.includes(key) ? Object.keys(value) : [],
        shorthand,
        unescape,
        value
      })
      if (!initializer) {
        return undefined
      }
      // Create a identifier if the current key is one and it is not an object
      if (
        identifiers.includes(key) &&
        !ts.isObjectLiteralExpression(initializer)
      ) {
        initializer = ts.factory.createIdentifier(value as string)
      }
      // Check key value equality before possibly modifying it
      const hasShorthandSupport = key === value
      if (key.match(/\W/g) && !key.startsWith("'") && !key.endsWith("'")) {
        key = `'${key}'`
      }
      const assignment =
        shorthand && hasShorthandSupport
          ? ts.factory.createShorthandPropertyAssignment(value)
          : ts.factory.createPropertyAssignment(key, initializer)
      const c = comments?.[key]
      if (c?.length) {
        addLeadingComment(assignment, c)
      }
      return assignment
    })
    .filter(isType<ts.ShorthandPropertyAssignment | ts.PropertyAssignment>)
  return ts.factory.createObjectLiteralExpression(
    properties as any[],
    multiLine
  )
}

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
  comments = {}
}: {
  name: string
  obj: T
  leadingComment: Comments
  comments: Record<string | number, Comments>
}): ts.EnumDeclaration => {
  const declaration = ts.factory.createEnumDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(name),
    Object.entries(obj).map(([key, value]) => {
      const initializer = toExpression({ unescape: true, value })
      const assignment = ts.factory.createEnumMember(key, initializer)
      const c = comments?.[key]
      if (c) {
        addLeadingComment(assignment, c)
      }
      return assignment
    })
  )
  if (leadingComment.length) {
    addLeadingComment(declaration, leadingComment)
  }
  return declaration
}
