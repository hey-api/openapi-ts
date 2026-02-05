import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';

const Mixed = PyDsl<py.MemberExpression>;

export class AttrPyDsl extends Mixed {
  readonly '~dsl' = 'AttrPyDsl';

  protected object?: MaybePyDsl<py.Expression>;
  protected prop?: NodeName;

  constructor(object: MaybePyDsl<py.Expression>, prop: NodeName) {
    super();
    this.object = object;
    this.name.set(prop);
  }

  static attr(object: MaybePyDsl<py.Expression>, prop: NodeName): AttrPyDsl {
    return new AttrPyDsl(object, prop);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.object);
    ctx.analyze(this.name);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  override toAst(): py.MemberExpression {
    this.$validate();

    return py.factory.createMemberExpression(
      this.$node(this.object!) as py.Expression,
      py.factory.createIdentifier(this.name.toString()),
    );
  }

  $validate(): asserts this is this & {
    object: MaybePyDsl<py.Expression>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Attribute access missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.object) missing.push('object');
    if (!this.name.toString()) missing.push('property name');
    return missing;
  }
}
