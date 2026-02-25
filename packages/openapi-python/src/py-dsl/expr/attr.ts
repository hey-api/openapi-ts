import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { fromRef, isSymbol, ref } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { ExprMixin } from '../mixins/expr';
import { f } from '../utils/factories';

export type AttrLeft = NodeName | MaybePyDsl<py.Expression>;
export type AttrCtor = (left: AttrLeft, right: NodeName) => AttrPyDsl;

const Mixed = ExprMixin(PyDsl<py.MemberExpression>);

export class AttrPyDsl extends Mixed {
  readonly '~dsl' = 'AttrPyDsl';

  protected left: Ref<AttrLeft>;

  constructor(left: AttrLeft, right: NodeName) {
    super();
    this.left = ref(left);
    this.name.set(right);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.left);
    ctx.analyze(this.name);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  override toAst() {
    this.$validate();

    const leftNode = this.$node(this.left);
    const right = fromRef(this.name);
    const value = isSymbol(right) ? right.finalName : right;
    return py.factory.createMemberExpression(
      leftNode,
      py.factory.createIdentifier(value as string),
    );
  }

  $validate(): asserts this is this & {
    left: MaybePyDsl<py.Expression>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Attribute access missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.name.toString()) missing.push('property name');
    return missing;
  }
}

f.attr.set((...args) => new AttrPyDsl(...args));
