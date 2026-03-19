import type { PyNodeBase } from './base';
import type { PyExpression } from './expression';
import type { PyDictComprehension } from './expressions/comprehensions/dict';
import type { PyListComprehension } from './expressions/comprehensions/list';
import type { PySetComprehension } from './expressions/comprehensions/set';

export type PyComprehension = PyDictComprehension | PyListComprehension | PySetComprehension;

export interface PyComprehensionNode extends PyNodeBase {
  ifs?: ReadonlyArray<PyExpression>;
  isAsync?: boolean;
  iterable: PyExpression;
  target: PyExpression;
}
