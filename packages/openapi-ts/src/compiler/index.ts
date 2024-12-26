import * as classes from './classes';
import * as convert from './convert';
import * as module from './module';
import * as _return from './return';
import * as transform from './transform';
import * as typedef from './typedef';
import * as types from './types';
import * as utils from './utils';

export type { Property } from './typedef';
export type { FunctionParameter } from './types';
export type { Comments } from './utils';
export type { ClassElement, Node, TypeNode } from 'typescript';

export const compiler = {
  anonymousFunction: types.createAnonymousFunction,
  arrayLiteralExpression: types.createArrayLiteralExpression,
  arrowFunction: types.createArrowFunction,
  asExpression: types.createAsExpression,
  assignment: types.createAssignment,
  awaitExpression: types.createAwaitExpression,
  binaryExpression: transform.createBinaryExpression,
  block: types.createBlock,
  callExpression: module.createCallExpression,
  classDeclaration: classes.createClassDeclaration,
  conditionalExpression: types.createConditionalExpression,
  constVariable: module.createConstVariable,
  constructorDeclaration: classes.createConstructorDeclaration,
  enumDeclaration: types.createEnumDeclaration,
  exportAllDeclaration: module.createExportAllDeclaration,
  exportNamedDeclaration: module.createNamedExportDeclarations,
  expressionToStatement: convert.expressionToStatement,
  forOfStatement: types.createForOfStatement,
  functionTypeNode: types.createFunctionTypeNode,
  identifier: utils.createIdentifier,
  ifStatement: transform.createIfStatement,
  indexedAccessTypeNode: types.createIndexedAccessTypeNode,
  isTsNode: utils.isTsNode,
  keywordTypeNode: types.createKeywordTypeNode,
  literalTypeNode: types.createLiteralTypeNode,
  methodDeclaration: classes.createMethodDeclaration,
  namedImportDeclarations: module.createNamedImportDeclarations,
  namespaceDeclaration: types.createNamespaceDeclaration,
  newExpression: types.createNewExpression,
  nodeToString: utils.tsNodeToString,
  null: types.createNull,
  objectExpression: types.createObjectType,
  ots: utils.ots,
  parameterDeclaration: types.createParameterDeclaration,
  propertyAccessExpression: types.createPropertyAccessExpression,
  propertyAccessExpressions: transform.createPropertyAccessExpressions,
  propertyAssignment: types.createPropertyAssignment,
  regularExpressionLiteral: types.createRegularExpressionLiteral,
  returnFunctionCall: _return.createReturnFunctionCall,
  returnStatement: _return.createReturnStatement,
  returnVariable: _return.createReturnVariable,
  safeAccessExpression: transform.createSafeAccessExpression,
  stringLiteral: types.createStringLiteral,
  stringToTsNodes: utils.stringToTsNodes,
  transformArrayMap: transform.createArrayMapTransform,
  transformArrayMutation: transform.createArrayTransformMutation,
  transformDateMutation: transform.createDateTransformMutation,
  transformFunctionMutation: transform.createFunctionTransformMutation,
  transformNewDate: transform.createDateTransformerExpression,
  typeAliasDeclaration: types.createTypeAliasDeclaration,
  typeArrayNode: typedef.createTypeArrayNode,
  typeInterfaceNode: typedef.createTypeInterfaceNode,
  typeIntersectionNode: typedef.createTypeIntersectionNode,
  typeNode: types.createTypeNode,
  typeOfExpression: types.createTypeOfExpression,
  typeParenthesizedNode: types.createTypeParenthesizedNode,
  typeRecordNode: typedef.createTypeRecordNode,
  typeReferenceNode: types.createTypeReferenceNode,
  typeTupleNode: typedef.createTypeTupleNode,
  typeUnionNode: typedef.createTypeUnionNode,
  valueToExpression: types.toExpression,
};
