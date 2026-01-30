import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';

export type CallArgs = ReadonlyArray<MaybePyDsl<py.Expression> | undefined>;

const Mixed = PyDsl<py.CallExpression>;

export class CallPyDsl extends Mixed {
  readonly '~dsl' = 'CallPyDsl';

  protected _args: Array<MaybePyDsl<py.Expression> | undefined> = [];
  protected _callee?: MaybePyDsl<py.Expression>;

  constructor(callee: MaybePyDsl<py.Expression>, ...args: CallArgs) {
    super();
    this._callee = callee;
    this._args = [...args];
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._callee);
    for (const arg of this._args) {
      if (arg) ctx.analyze(arg);
    }
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  arg(arg: MaybePyDsl<py.Expression>): this {
    this._args.push(arg);
    return this;
  }

  args(...args: CallArgs): this {
    this._args.push(...args);
    return this;
  }

  override toAst(): py.CallExpression {
    this.$validate();

    const astArgs = this._args
      .filter((a): a is MaybePyDsl<py.Expression> => a !== undefined)
      .map((arg) => this.$node(arg) as py.Expression);

    return py.factory.createCallExpression(this.$node(this._callee!) as py.Expression, astArgs);
  }

  $validate(): asserts this is this & {
    _callee: MaybePyDsl<py.Expression>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Call expression missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._callee) missing.push('callee');
    return missing;
  }
}
