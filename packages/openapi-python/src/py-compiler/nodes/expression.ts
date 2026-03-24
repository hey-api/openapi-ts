import type { PyComprehension } from './comprehension';
import type { PyAsyncExpression } from './expressions/async';
import type { PyAwaitExpression } from './expressions/await';
import type { PyBinaryExpression } from './expressions/binary';
import type { PyCallExpression } from './expressions/call';
import type { PyDictExpression } from './expressions/dict';
import type { PyFStringExpression } from './expressions/fString';
import type { PyGeneratorExpression } from './expressions/generator';
import type { PyIdentifier } from './expressions/identifier';
import type { PyKeywordArgument } from './expressions/keywordArg';
import type { PyLambdaExpression } from './expressions/lambda';
import type { PyListExpression } from './expressions/list';
import type { PyLiteral } from './expressions/literal';
import type { PyMemberExpression } from './expressions/member';
import type { PySetExpression } from './expressions/set';
import type { PySubscriptExpression } from './expressions/subscript';
import type { PySubscriptSlice } from './expressions/subscript-slice';
import type { PyTupleExpression } from './expressions/tuple';
import type { PyYieldExpression } from './expressions/yield';
import type { PyYieldFromExpression } from './expressions/yieldFrom';

export type PyExpression =
  | PyAsyncExpression
  | PyAwaitExpression
  | PyBinaryExpression
  | PyCallExpression
  | PyComprehension
  | PyDictExpression
  | PyFStringExpression
  | PyGeneratorExpression
  | PyIdentifier
  | PyKeywordArgument
  | PyLambdaExpression
  | PyListExpression
  | PyLiteral
  | PyMemberExpression
  | PySetExpression
  | PySubscriptExpression
  | PySubscriptSlice
  | PyTupleExpression
  | PyYieldExpression
  | PyYieldFromExpression;
