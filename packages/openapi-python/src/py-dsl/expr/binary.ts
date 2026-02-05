import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';

export type PyBinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '//'
  | '%'
  | '**'
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'is'
  | 'is not'
  | 'in'
  | 'not in'
  | 'and'
  | 'or';

const Mixed = PyDsl<py.BinaryExpression>;

export class BinaryPyDsl extends Mixed {
  readonly '~dsl' = 'BinaryPyDsl';

  protected _left?: MaybePyDsl<py.Expression>;
  protected _op?: PyBinaryOperator;
  protected _right?: MaybePyDsl<py.Expression>;

  constructor(
    left: MaybePyDsl<py.Expression>,
    op: PyBinaryOperator,
    right: MaybePyDsl<py.Expression>,
  ) {
    super();
    this._left = left;
    this._op = op;
    this._right = right;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._left);
    ctx.analyze(this._right);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  and(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('and', right);
  }

  div(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('/', right);
  }

  eq(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('==', right);
  }

  floordiv(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('//', right);
  }

  gt(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('>', right);
  }

  gte(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('>=', right);
  }

  in_(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('in', right);
  }

  is(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('is', right);
  }

  isNot(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('is not', right);
  }

  lt(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('<', right);
  }

  lte(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('<=', right);
  }

  minus(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('-', right);
  }

  mod(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('%', right);
  }

  neq(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('!=', right);
  }

  notIn(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('not in', right);
  }

  or(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('or', right);
  }

  plus(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('+', right);
  }

  pow(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('**', right);
  }

  times(right: MaybePyDsl<py.Expression>): this {
    return this.opAndExpr('*', right);
  }

  override toAst(): py.BinaryExpression {
    this.$validate();

    return py.factory.createBinaryExpression(
      this.$node(this._left!) as py.Expression,
      this._op!,
      this.$node(this._right!) as py.Expression,
    );
  }

  $validate(): asserts this is this & {
    _left: MaybePyDsl<py.Expression>;
    _op: PyBinaryOperator;
    _right: MaybePyDsl<py.Expression>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Binary expression missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._left) missing.push('left operand');
    if (!this._op) missing.push('operator');
    if (!this._right) missing.push('right operand');
    return missing;
  }

  private opAndExpr(op: PyBinaryOperator, right: MaybePyDsl<py.Expression>): this {
    this._right = right;
    this._op = op;
    return this;
  }
}
