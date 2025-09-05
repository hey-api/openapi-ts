import ts from 'typescript';

import { createAsExpression, createTypeReferenceNode } from './types';
import {
  addLeadingComments,
  type Comments,
  createIdentifier,
  createModifier,
  type ImportExportItemObject,
  ots,
} from './utils';

/**
 * Create export all declaration. Example: `export * from './y'`.
 * @param module - module containing exports
 * @returns ts.ExportDeclaration
 */
export const createExportAllDeclaration = ({
  module,
}: {
  module: string;
}): ts.ExportDeclaration => {
  const statement = ts.factory.createExportDeclaration(
    undefined,
    false,
    undefined,
    ots.string(module),
  );
  return statement;
};

export type ImportExportItem = ImportExportItemObject | string;

export const createCallExpression = ({
  functionName,
  parameters = [],
  types,
}: {
  functionName:
    | string
    | ts.PropertyAccessExpression
    | ts.PropertyAccessChain
    | ts.ElementAccessExpression
    | ts.Expression;
  parameters?: Array<string | ts.Expression | undefined>;
  types?: ReadonlyArray<ts.TypeNode>;
}) => {
  const expression =
    typeof functionName === 'string'
      ? createIdentifier({ text: functionName })
      : functionName;
  const argumentsArray = parameters
    .filter((parameter) => parameter !== undefined)
    .map((parameter) =>
      typeof parameter === 'string'
        ? createIdentifier({ text: parameter })
        : parameter,
    );
  const callExpression = ts.factory.createCallExpression(
    expression,
    types,
    argumentsArray,
  );
  return callExpression;
};

/**
 * Create a named export declaration. Example: `export { X } from './y'`.
 * @param exports - named imports to export
 * @param module - module containing exports
 * @returns ts.ExportDeclaration
 */
export const createNamedExportDeclarations = ({
  exports,
  module,
}: {
  exports: Array<ImportExportItem> | ImportExportItem;
  module: string;
}): ts.ExportDeclaration => {
  const exportedTypes = Array.isArray(exports) ? exports : [exports];
  const hasNonTypeExport = exportedTypes.some(
    (item) => typeof item !== 'object' || !item.asType,
  );
  const elements = exportedTypes.map((name) => {
    const item = typeof name === 'string' ? { name } : name;
    return ots.export({
      alias: item.alias,
      asType: hasNonTypeExport && item.asType,
      name: item.name,
    });
  });
  const exportClause = ts.factory.createNamedExports(elements);
  const moduleSpecifier = ots.string(module);
  const statement = ts.factory.createExportDeclaration(
    undefined,
    !hasNonTypeExport,
    exportClause,
    moduleSpecifier,
  );
  return statement;
};

/**
 * Create a const variable. Optionally, it can use const assertion or export
 * statement. Example: `export x = {} as const`.
 * @param assertion use const assertion?
 * @param exportConst export created variable?
 * @param expression expression for the variable.
 * @param name name of the variable.
 * @returns ts.VariableStatement
 */
export const createConstVariable = ({
  assertion,
  comment,
  destructure,
  exportConst,
  expression,
  name,
  typeName,
}: {
  assertion?: 'const' | ts.TypeNode;
  comment?: Comments;
  destructure?: boolean;
  exportConst?: boolean;
  expression: ts.Expression;
  name: string | ts.TypeReferenceNode;
  // TODO: support a more intuitive definition of generics for example
  typeName?: string | ts.IndexedAccessTypeNode | ts.TypeNode;
}): ts.VariableStatement => {
  const initializer = assertion
    ? createAsExpression({
        expression,
        type:
          typeof assertion === 'string'
            ? createTypeReferenceNode({ typeName: assertion })
            : assertion,
      })
    : expression;
  const nameIdentifier =
    typeof name === 'string'
      ? createIdentifier({ text: name })
      : // TODO: https://github.com/hey-api/openapi-ts/issues/2289
        (name as unknown as ts.Identifier);
  const declaration = ts.factory.createVariableDeclaration(
    destructure
      ? ts.factory.createObjectBindingPattern([
          ts.factory.createBindingElement(
            undefined,
            undefined,
            nameIdentifier,
            undefined,
          ),
        ])
      : nameIdentifier,
    undefined,
    typeName
      ? typeof typeName === 'string'
        ? createTypeReferenceNode({ typeName })
        : typeName
      : undefined,
    initializer,
  );
  const statement = ts.factory.createVariableStatement(
    exportConst ? [createModifier({ keyword: 'export' })] : undefined,
    ts.factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const),
  );

  addLeadingComments({
    comments: comment,
    node: statement,
  });

  return statement;
};

/**
 * Create an import declaration. Example: `import X from './y'`.
 * @param name - import name
 * @param module - module containing imports
 * @returns ts.ImportDeclaration
 */
export const createDefaultImportDeclaration = ({
  module,
  name,
}: {
  module: string;
  name: string;
}): ts.ImportDeclaration => {
  const importClause = ts.factory.createImportClause(
    false, // isTypeOnly
    createIdentifier({ text: name }), // name (default import)
    undefined, // namedBindings
  );
  const moduleSpecifier = ots.string(module);
  const statement = ts.factory.createImportDeclaration(
    undefined, // modifiers
    importClause,
    moduleSpecifier,
  );
  return statement;
};

/**
 * Create a named import declaration. Example: `import { X } from './y'`.
 * @param imports - named exports to import
 * @param module - module containing imports
 * @returns ts.ImportDeclaration
 */
export const createNamedImportDeclarations = ({
  imports,
  module,
}: {
  imports: Array<ImportExportItem> | ImportExportItem;
  module: string;
}): ts.ImportDeclaration => {
  const importedTypes = Array.isArray(imports) ? imports : [imports];
  const hasNonTypeImport = importedTypes.some(
    (item) => typeof item !== 'object' || !item.asType,
  );
  let namespaceImport: ImportExportItemObject | undefined;
  const elements: Array<ts.ImportSpecifier> = [];
  importedTypes.forEach((name) => {
    const item = typeof name === 'string' ? { name } : name;
    if (item.name === '*' && item.alias) {
      namespaceImport = item;
    } else {
      elements.push(
        ots.import({
          alias: item.alias,
          asType: hasNonTypeImport && item.asType,
          name: item.name,
        }),
      );
    }
  });
  const namedBindings = namespaceImport
    ? ts.factory.createNamespaceImport(
        createIdentifier({ text: namespaceImport.alias! }),
      )
    : ts.factory.createNamedImports(elements);
  const importClause = ts.factory.createImportClause(
    !hasNonTypeImport,
    undefined,
    namedBindings,
  );
  const moduleSpecifier = ots.string(module);
  const statement = ts.factory.createImportDeclaration(
    undefined,
    importClause,
    moduleSpecifier,
  );
  return statement;
};
