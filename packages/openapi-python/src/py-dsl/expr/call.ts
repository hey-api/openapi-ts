import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { ArgsMixin } from '../mixins/args';
import { ExprMixin } from '../mixins/expr';
import { f } from '../utils/factories';

export type CallArgs = ReadonlyArray<CallCallee | undefined>;
export type CallCallee = NodeName | MaybePyDsl<py.Expression>;
export type CallCtor = (callee: CallCallee, ...args: CallArgs) => CallPyDsl;

const Mixed = ArgsMixin(ExprMixin(PyDsl<py.CallExpression>));

export class CallPyDsl extends Mixed {
  readonly '~dsl' = 'CallPyDsl';

  protected _callee: Ref<CallCallee>;

  constructor(callee: CallCallee, ...args: CallArgs) {
    super();
    this._callee = ref(callee);
    this.args(...args);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._callee);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  override toAst() {
    this.$validate();

    return py.factory.createCallExpression(this.$node(this._callee!), this.$args());
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

f.call.set((...args) => new CallPyDsl(...args));
