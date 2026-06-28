import type { TsArrayBindingPattern } from './declarations/array-binding-pattern';
import type { TsBindingElement } from './declarations/binding-element';
import type { TsDecorator } from './declarations/decorator';
import type { TsExportSpecifier } from './declarations/export-specifier';
import type { TsHeritageClause } from './declarations/heritage-clause';
import type { TsImportClause } from './declarations/import-clause';
import type { TsImportSpecifier } from './declarations/import-specifier';
import type { TsNamedExports } from './declarations/named-exports';
import type { TsNamedImports } from './declarations/named-imports';
import type { TsNamespaceExport } from './declarations/namespace-export';
import type { TsNamespaceImport } from './declarations/namespace-import';
import type { TsObjectBindingPattern } from './declarations/object-binding-pattern';
import type { TsParameterDeclaration } from './declarations/parameter-declaration';
import type { TsTypeParameterDeclaration } from './declarations/type-parameter-declaration';
import type { TsExpression } from './expression';
import type { TsPropertyAssignment } from './expressions/property-assignment';
import type { TsShorthandPropertyAssignment } from './expressions/shorthand-property-assignment';
import type { TsSpreadAssignment } from './expressions/spread-assignment';
import type { TsTemplateHead } from './expressions/template-head';
import type { TsTemplateMiddle } from './expressions/template-middle';
import type { TsTemplateSpan } from './expressions/template-span';
import type { TsTemplateTail } from './expressions/template-tail';
import type { TsJSDoc } from './jsdoc/jsdoc';
import type { TsJSDocText } from './jsdoc/jsdoc-text';
import type { TsNodeKind } from './kinds';
import type { TsStatement } from './statement';
import type { TsCatchClause } from './statements/catch-clause';
import type { TsSourceFile } from './structure/source-file';
import type { TsToken } from './token';
import type { TsTypeNode } from './type';

export interface TsNodeBase {
  getSourceFile?(): TsSourceFile;
  kind: TsNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type TsNode =
  | TsArrayBindingPattern
  | TsBindingElement
  | TsCatchClause
  | TsDecorator
  | TsExportSpecifier
  | TsExpression
  | TsHeritageClause
  | TsImportClause
  | TsImportSpecifier
  | TsJSDoc
  | TsJSDocText
  | TsNamedExports
  | TsNamedImports
  | TsNamespaceExport
  | TsNamespaceImport
  | TsObjectBindingPattern
  | TsParameterDeclaration
  | TsPropertyAssignment
  | TsShorthandPropertyAssignment
  | TsSourceFile
  | TsSpreadAssignment
  | TsStatement
  | TsTemplateHead
  | TsTemplateMiddle
  | TsTemplateSpan
  | TsTemplateTail
  | TsToken
  | TsTypeNode
  | TsTypeParameterDeclaration;
