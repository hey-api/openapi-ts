import type { TsClassDeclaration } from './declarations/class-declaration';
import type { TsConstructorDeclaration } from './declarations/constructor-declaration';
import type { TsEnumDeclaration } from './declarations/enum-declaration';
import type { TsEnumMember } from './declarations/enum-member';
import type { TsExportDeclaration } from './declarations/export-declaration';
import type { TsFunctionDeclaration } from './declarations/function-declaration';
import type { TsGetAccessorDeclaration } from './declarations/get-accessor-declaration';
import type { TsImportDeclaration } from './declarations/import-declaration';
import type { TsIndexSignatureDeclaration } from './declarations/index-signature-declaration';
import type { TsInterfaceDeclaration } from './declarations/interface-declaration';
import type { TsMethodDeclaration } from './declarations/method-declaration';
import type { TsPropertyDeclaration } from './declarations/property-declaration';
import type { TsPropertySignature } from './declarations/property-signature';
import type { TsSetAccessorDeclaration } from './declarations/set-accessor-declaration';
import type { TsTypeAliasDeclaration } from './declarations/type-alias-declaration';
import type { TsVariableDeclaration } from './declarations/variable-declaration';
import type { TsVariableDeclarationList } from './declarations/variable-declaration-list';
import type { TsVariableStatement } from './declarations/variable-statement';
import type { TsBlock } from './statements/block';
import type { TsExpressionStatement } from './statements/expression-statement';
import type { TsForInStatement } from './statements/for-in-statement';
import type { TsForOfStatement } from './statements/for-of-statement';
import type { TsForStatement } from './statements/for-statement';
import type { TsIfStatement } from './statements/if-statement';
import type { TsReturnStatement } from './statements/return-statement';
import type { TsThrowStatement } from './statements/throw-statement';
import type { TsTryStatement } from './statements/try-statement';

export type TsStatement =
  | TsBlock
  | TsClassDeclaration
  | TsConstructorDeclaration
  | TsEnumDeclaration
  | TsEnumMember
  | TsExportDeclaration
  | TsExpressionStatement
  | TsForInStatement
  | TsForOfStatement
  | TsForStatement
  | TsFunctionDeclaration
  | TsGetAccessorDeclaration
  | TsIfStatement
  | TsImportDeclaration
  | TsIndexSignatureDeclaration
  | TsInterfaceDeclaration
  | TsMethodDeclaration
  | TsPropertyDeclaration
  | TsPropertySignature
  | TsReturnStatement
  | TsSetAccessorDeclaration
  | TsThrowStatement
  | TsTryStatement
  | TsTypeAliasDeclaration
  | TsVariableDeclaration
  | TsVariableDeclarationList
  | TsVariableStatement;
