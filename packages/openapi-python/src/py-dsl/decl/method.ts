import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import { PyDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import { LayoutMixin } from '../mixins/layout';
import { AsyncMixin } from '../mixins/modifiers';
import { ParamMixin } from '../mixins/param';
import { ReturnsMixin } from '../mixins/returns';
import { safeKeywordName } from '../utils/name';

const Mixed = AsyncMixin(
  DecoratorMixin(
    DocMixin(DoMixin(LayoutMixin(ParamMixin(ReturnsMixin(PyDsl<py.FunctionDeclaration>))))),
  ),
);

export class MethodPyDsl extends Mixed {
  readonly '~dsl' = 'MethodPyDsl';
  override readonly nameSanitizer = safeKeywordName;

  constructor(name: NodeName, fn?: (f: MethodPyDsl) => void) {
    super();
    this.name.set(name);
    if (isSymbol(name)) {
      name.setKind('function');
    }
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    ctx.pushScope();
    try {
      super.analyze(ctx);
      ctx.analyze(this.name);
    } finally {
      ctx.popScope();
    }
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return !this.missingRequiredCalls().length;
  }

  override toAst() {
    this.$validate();
    return py.factory.createFunctionDeclaration(
      this.name.toString(),
      this.$params(),
      this.$returns(),
      this.$do(),
      this.$decorators(),
      this.$docs(),
      this.modifiers,
    );
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (!missing.length) return;
    throw new Error(`Method declaration missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.name.toString()) missing.push('name');
    return missing;
  }
}
