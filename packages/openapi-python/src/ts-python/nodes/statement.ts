import type { PyClassDeclaration } from './declarations/class';
import type { PyFunctionDeclaration } from './declarations/function';
import type { PyAssignment } from './statements/assignment';
import type { PyAugmentedAssignment } from './statements/augmentedAssignment';
import type { PyBreakStatement } from './statements/break';
import type { PyContinueStatement } from './statements/continue';
import type { PyEmptyStatement } from './statements/empty';
import type { PyExpressionStatement } from './statements/expression';
import type { PyForStatement } from './statements/for';
import type { PyIfStatement } from './statements/if';
import type { PyImportStatement } from './statements/import';
import type { PyRaiseStatement } from './statements/raise';
import type { PyReturnStatement } from './statements/return';
import type { PyTryStatement } from './statements/try';
import type { PyWhileStatement } from './statements/while';
import type { PyWithStatement } from './statements/with';
import type { PyComment } from './structure/comment';

export type PyStatement =
  | PyAssignment
  | PyAugmentedAssignment
  | PyBreakStatement
  | PyClassDeclaration
  | PyComment
  | PyContinueStatement
  | PyEmptyStatement
  | PyExpressionStatement
  | PyForStatement
  | PyFunctionDeclaration
  | PyIfStatement
  | PyImportStatement
  | PyRaiseStatement
  | PyReturnStatement
  | PyTryStatement
  | PyWhileStatement
  | PyWithStatement;
