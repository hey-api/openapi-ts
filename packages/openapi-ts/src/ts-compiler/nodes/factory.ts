import { createArrayBindingPattern } from './declarations/array-binding-pattern';
import { createBindingElement } from './declarations/binding-element';
import { createClassDeclaration } from './declarations/class-declaration';
import { createConstructorDeclaration } from './declarations/constructor-declaration';
import { createDecorator } from './declarations/decorator';
import { createEnumDeclaration } from './declarations/enum-declaration';
import { createEnumMember } from './declarations/enum-member';
import { createExportDeclaration } from './declarations/export-declaration';
import { createExportSpecifier } from './declarations/export-specifier';
import { createFunctionDeclaration } from './declarations/function-declaration';
import { createGetAccessorDeclaration } from './declarations/get-accessor-declaration';
import { createHeritageClause } from './declarations/heritage-clause';
import { createImportClause } from './declarations/import-clause';
import { createImportDeclaration } from './declarations/import-declaration';
import { createImportSpecifier } from './declarations/import-specifier';
import { createIndexSignature } from './declarations/index-signature-declaration';
import { createInterfaceDeclaration } from './declarations/interface-declaration';
import { createMethodDeclaration } from './declarations/method-declaration';
import { createNamedExports } from './declarations/named-exports';
import { createNamedImports } from './declarations/named-imports';
import { createNamespaceExport } from './declarations/namespace-export';
import { createNamespaceImport } from './declarations/namespace-import';
import { createObjectBindingPattern } from './declarations/object-binding-pattern';
import { createParameterDeclaration } from './declarations/parameter-declaration';
import { createPropertyDeclaration } from './declarations/property-declaration';
import { createPropertySignature } from './declarations/property-signature';
import { createSetAccessorDeclaration } from './declarations/set-accessor-declaration';
import { createTypeAliasDeclaration } from './declarations/type-alias-declaration';
import { createTypeParameterDeclaration } from './declarations/type-parameter-declaration';
import { createVariableDeclaration } from './declarations/variable-declaration';
import { createVariableDeclarationList } from './declarations/variable-declaration-list';
import { createVariableStatement } from './declarations/variable-statement';
import { createArrayLiteralExpression } from './expressions/array-literal-expression';
import { createArrowFunction } from './expressions/arrow-function';
import { createAsExpression } from './expressions/as-expression';
import { createAwaitExpression } from './expressions/await-expression';
import { createBigIntLiteral } from './expressions/big-int-literal';
import { createBinaryExpression } from './expressions/binary-expression';
import { createCallExpression } from './expressions/call-expression';
import { createComputedPropertyName } from './expressions/computed-property-name';
import { createConditionalExpression } from './expressions/conditional-expression';
import { createDeleteExpression } from './expressions/delete-expression';
import {
  createElementAccessChain,
  createElementAccessExpression,
} from './expressions/element-access-expression';
import { createExpressionWithTypeArguments } from './expressions/expression-with-type-arguments';
import { createFunctionExpression } from './expressions/function-expression';
import { createIdentifier } from './expressions/identifier';
import { createFalse, createNull, createTrue } from './expressions/keyword-literals';
import { createNewExpression } from './expressions/new-expression';
import { createNoSubstitutionTemplateLiteral } from './expressions/no-substitution-template-literal';
import { createNonNullExpression } from './expressions/non-null-expression';
import { createNumericLiteral } from './expressions/numeric-literal';
import { createObjectLiteralExpression } from './expressions/object-literal-expression';
import { createParenthesizedExpression } from './expressions/parenthesized-expression';
import { createPostfixUnaryExpression } from './expressions/postfix-unary-expression';
import { createPrefixUnaryExpression } from './expressions/prefix-unary-expression';
import { createPrivateIdentifier } from './expressions/private-identifier';
import {
  createPropertyAccessChain,
  createPropertyAccessExpression,
} from './expressions/property-access-expression';
import { createPropertyAssignment } from './expressions/property-assignment';
import { createQualifiedName } from './expressions/qualified-name';
import { createRegularExpressionLiteral } from './expressions/regular-expression-literal';
import { createSatisfiesExpression } from './expressions/satisfies-expression';
import { createShorthandPropertyAssignment } from './expressions/shorthand-property-assignment';
import { createSpreadAssignment } from './expressions/spread-assignment';
import { createSpreadElement } from './expressions/spread-element';
import { createStringLiteral } from './expressions/string-literal';
import { createTaggedTemplateExpression } from './expressions/tagged-template-expression';
import { createTemplateExpression } from './expressions/template-expression';
import { createTemplateHead } from './expressions/template-head';
import { createTemplateMiddle } from './expressions/template-middle';
import { createTemplateSpan } from './expressions/template-span';
import { createTemplateTail } from './expressions/template-tail';
import { createTypeOfExpression } from './expressions/type-of-expression';
import { createVoidExpression } from './expressions/void-expression';
import { createJSDocComment } from './jsdoc/jsdoc';
import { createJSDocText } from './jsdoc/jsdoc-text';
import { createNodeArray } from './node-array';
import { createBlock } from './statements/block';
import { createCatchClause } from './statements/catch-clause';
import { createExpressionStatement } from './statements/expression-statement';
import { createForInStatement } from './statements/for-in-statement';
import { createForOfStatement } from './statements/for-of-statement';
import { createForStatement } from './statements/for-statement';
import { createIfStatement } from './statements/if-statement';
import { createReturnStatement } from './statements/return-statement';
import { createThrowStatement } from './statements/throw-statement';
import { createTryStatement } from './statements/try-statement';
import { createSourceFile } from './structure/source-file';
import { createModifier, createToken } from './token';
import { createArrayTypeNode } from './types/array-type-node';
import { createConditionalTypeNode } from './types/conditional-type-node';
import { createFunctionTypeNode } from './types/function-type-node';
import { createIndexedAccessTypeNode } from './types/indexed-access-type-node';
import { createIntersectionTypeNode } from './types/intersection-type-node';
import { createKeywordTypeNode } from './types/keyword-type-node';
import { createLiteralTypeNode } from './types/literal-type-node';
import { createMappedTypeNode } from './types/mapped-type-node';
import { createNamedTupleMember } from './types/named-tuple-member';
import { createTemplateLiteralType } from './types/template-literal-type';
import { createTemplateLiteralTypeSpan } from './types/template-literal-type-span';
import { createTupleTypeNode } from './types/tuple-type-node';
import { createTypeLiteralNode } from './types/type-literal-node';
import { createTypeOperatorNode } from './types/type-operator-node';
import { createTypeQueryNode } from './types/type-query-node';
import { createTypeReferenceNode } from './types/type-reference-node';
import { createUnionTypeNode } from './types/union-type-node';

export const factory = {
  createArrayBindingPattern,
  createArrayLiteralExpression,
  createArrayTypeNode,
  createArrowFunction,
  createAsExpression,
  createAwaitExpression,
  createBigIntLiteral,
  createBinaryExpression,
  createBindingElement,
  createBlock,
  createCallExpression,
  createCatchClause,
  createClassDeclaration,
  createComputedPropertyName,
  createConditionalExpression,
  createConditionalTypeNode,
  createConstructorDeclaration,
  createDecorator,
  createDeleteExpression,
  createElementAccessChain,
  createElementAccessExpression,
  createEnumDeclaration,
  createEnumMember,
  createExportDeclaration,
  createExportSpecifier,
  createExpressionStatement,
  createExpressionWithTypeArguments,
  createFalse,
  createForInStatement,
  createForOfStatement,
  createForStatement,
  createFunctionDeclaration,
  createFunctionExpression,
  createFunctionTypeNode,
  createGetAccessorDeclaration,
  createHeritageClause,
  createIdentifier,
  createIfStatement,
  createImportClause,
  createImportDeclaration,
  createImportSpecifier,
  createIndexSignature,
  createIndexedAccessTypeNode,
  createInterfaceDeclaration,
  createIntersectionTypeNode,
  createJSDocComment,
  createJSDocText,
  createKeywordTypeNode,
  createLiteralTypeNode,
  createMappedTypeNode,
  createMethodDeclaration,
  createModifier,
  createNamedExports,
  createNamedImports,
  createNamedTupleMember,
  createNamespaceExport,
  createNamespaceImport,
  createNewExpression,
  createNoSubstitutionTemplateLiteral,
  createNodeArray,
  createNonNullExpression,
  createNull,
  createNumericLiteral,
  createObjectBindingPattern,
  createObjectLiteralExpression,
  createParameterDeclaration,
  createParenthesizedExpression,
  createPostfixUnaryExpression,
  createPrefixUnaryExpression,
  createPrivateIdentifier,
  createPropertyAccessChain,
  createPropertyAccessExpression,
  createPropertyAssignment,
  createPropertyDeclaration,
  createPropertySignature,
  createQualifiedName,
  createRegularExpressionLiteral,
  createReturnStatement,
  createSatisfiesExpression,
  createSetAccessorDeclaration,
  createShorthandPropertyAssignment,
  createSourceFile,
  createSpreadAssignment,
  createSpreadElement,
  createStringLiteral,
  createTaggedTemplateExpression,
  createTemplateExpression,
  createTemplateHead,
  createTemplateLiteralType,
  createTemplateLiteralTypeSpan,
  createTemplateMiddle,
  createTemplateSpan,
  createTemplateTail,
  createThrowStatement,
  createToken,
  createTrue,
  createTryStatement,
  createTupleTypeNode,
  createTypeAliasDeclaration,
  createTypeLiteralNode,
  createTypeOfExpression,
  createTypeOperatorNode,
  createTypeParameterDeclaration,
  createTypeQueryNode,
  createTypeReferenceNode,
  createUnionTypeNode,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  createVoidExpression,
} as const;
