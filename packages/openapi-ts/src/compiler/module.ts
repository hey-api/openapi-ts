import ts from 'typescript';

import { addLeadingJSDocComment, type Comments, ots } from './utils';

/**
 * Create export all declaration. Example: `export * from './y'`.
 * @param module - module to export from.
 * @returns ts.ExportDeclaration
 */
export const createExportAllDeclaration = (module: string) =>
  ts.factory.createExportDeclaration(
    undefined,
    false,
    undefined,
    ots.string(module),
  );

type ImportItem =
  | { name: string; isTypeOnly?: boolean; alias?: string }
  | string;

/**
 * Create a named export declaration. Example: `export { X } from './y'`.
 * @param items - the items to export.
 * @param module - module to export it from.
 * @returns ExportDeclaration
 */
export const createNamedExportDeclarations = (
  items: Array<ImportItem> | ImportItem,
  module: string,
): ts.ExportDeclaration => {
  items = Array.isArray(items) ? items : [items];
  const isAllTypes = items.every((i) => typeof i === 'object' && i.isTypeOnly);
  return ts.factory.createExportDeclaration(
    undefined,
    isAllTypes,
    ts.factory.createNamedExports(
      items.map((item) => {
        const {
          name,
          isTypeOnly = undefined,
          alias = undefined,
        } = typeof item === 'string' ? { name: item } : item;
        return ots.export(
          name,
          isAllTypes ? false : Boolean(isTypeOnly),
          alias,
        );
      }),
    ),
    ots.string(module),
  );
};

/**
 * Create a const variable export. Optionally, it can use const assertion.
 * Example: `export x = {} as const`.
 * @param constAssertion use const assertion?
 * @param expression expression for the variable.
 * @param name name of the variable.
 * @returns ts.VariableStatement
 */
export const createExportConstVariable = ({
  comment,
  constAssertion = false,
  expression,
  name,
}: {
  comment?: Comments;
  constAssertion?: boolean;
  expression: ts.Expression;
  name: string;
}): ts.VariableStatement => {
  const initializer = constAssertion
    ? ts.factory.createAsExpression(
        expression,
        ts.factory.createTypeReferenceNode('const'),
      )
    : expression;
  const declaration = ts.factory.createVariableDeclaration(
    ts.factory.createIdentifier(name),
    undefined,
    undefined,
    initializer,
  );
  const statement = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const),
  );
  if (comment) {
    addLeadingJSDocComment(statement, comment);
  }
  return statement;
};

/**
 * Create a named import declaration. Example: `import { X } from './y'`.
 * @param items - the items to export.
 * @param module - module to export it from.
 * @returns ImportDeclaration
 */
export const createNamedImportDeclarations = (
  items: Array<ImportItem> | ImportItem,
  module: string,
): ts.ImportDeclaration => {
  items = Array.isArray(items) ? items : [items];
  const isAllTypes = items.every((i) => typeof i === 'object' && i.isTypeOnly);
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      isAllTypes,
      undefined,
      ts.factory.createNamedImports(
        items.map((item) => {
          const {
            name,
            isTypeOnly = undefined,
            alias = undefined,
          } = typeof item === 'string' ? { name: item } : item;
          return ots.import(
            name,
            isAllTypes ? false : Boolean(isTypeOnly),
            alias,
          );
        }),
      ),
    ),
    ots.string(module),
  );
};
