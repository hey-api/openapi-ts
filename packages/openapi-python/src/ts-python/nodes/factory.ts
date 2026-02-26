import { createClassDeclaration } from './declarations/class';
import { createFunctionDeclaration } from './declarations/function';
import { createFunctionParameter } from './declarations/functionParameter';
import { createAsyncExpression } from './expressions/async';
import { createAwaitExpression } from './expressions/await';
import { createBinaryExpression } from './expressions/binary';
import { createCallExpression } from './expressions/call';
import { createDictComprehension } from './expressions/comprehensions/dict';
import { createListComprehension } from './expressions/comprehensions/list';
import { createSetComprehension } from './expressions/comprehensions/set';
import { createDictExpression } from './expressions/dict';
import { createFStringExpression } from './expressions/fString';
import { createGeneratorExpression } from './expressions/generator';
import { createIdentifier } from './expressions/identifier';
import { createLambdaExpression } from './expressions/lambda';
import { createListExpression } from './expressions/list';
import { createLiteral } from './expressions/literal';
import { createMemberExpression } from './expressions/member';
import { createSetExpression } from './expressions/set';
import { createSubscriptExpression } from './expressions/subscript';
import { createSubscriptSlice } from './expressions/subscript-slice';
import { createTupleExpression } from './expressions/tuple';
import { createYieldExpression } from './expressions/yield';
import { createYieldFromExpression } from './expressions/yieldFrom';
import { createAssignment } from './statements/assignment';
import { createAugmentedAssignment } from './statements/augmentedAssignment';
import { createBlock } from './statements/block';
import { createBreakStatement } from './statements/break';
import { createContinueStatement } from './statements/continue';
import { createEmptyStatement } from './statements/empty';
import { createExceptClause } from './statements/except';
import { createExpressionStatement } from './statements/expression';
import { createForStatement } from './statements/for';
import { createIfStatement } from './statements/if';
import { createImportStatement } from './statements/import';
import { createRaiseStatement } from './statements/raise';
import { createReturnStatement } from './statements/return';
import { createTryStatement } from './statements/try';
import { createWhileStatement } from './statements/while';
import { createWithStatement } from './statements/with';
import { createWithItem } from './statements/withItem';
import { createComment } from './structure/comment';
import { createSourceFile } from './structure/sourceFile';

export const factory = {
  createAssignment,
  createAsyncExpression,
  createAugmentedAssignment,
  createAwaitExpression,
  createBinaryExpression,
  createBlock,
  createBreakStatement,
  createCallExpression,
  createClassDeclaration,
  createComment,
  createContinueStatement,
  createDictComprehension,
  createDictExpression,
  createEmptyStatement,
  createExceptClause,
  createExpressionStatement,
  createFStringExpression,
  createForStatement,
  createFunctionDeclaration,
  createFunctionParameter,
  createGeneratorExpression,
  createIdentifier,
  createIfStatement,
  createImportStatement,
  createLambdaExpression,
  createListComprehension,
  createListExpression,
  createLiteral,
  createMemberExpression,
  createRaiseStatement,
  createReturnStatement,
  createSetComprehension,
  createSetExpression,
  createSourceFile,
  createSubscriptExpression,
  createSubscriptSlice,
  createTryStatement,
  createTupleExpression,
  createWhileStatement,
  createWithItem,
  createWithStatement,
  createYieldExpression,
  createYieldFromExpression,
};
