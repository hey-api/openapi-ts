import type { AnalysisContext, NodeName, NodeNameSanitizer } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import { LayoutMixin } from '../mixins/layout';
import { AsyncMixin, ExportMixin } from '../mixins/modifiers';
import { ParamMixin } from '../mixins/param';
import { ReturnsMixin } from '../mixins/returns';
import { safeRuntimeName } from '../utils/name';

const Mixed = AsyncMixin(
  DecoratorMixin(
    DocMixin(
      DoMixin(ExportMixin(LayoutMixin(ParamMixin(ReturnsMixin(PyDsl<py.FunctionDeclaration>))))),
    ),
  ),
);

export class FuncPyDsl extends Mixed {
  readonly '~dsl' = 'FuncPyDsl';
  override readonly nameSanitizer: NodeNameSanitizer;

  constructor(
    name: NodeName,
    fn?: (f: FuncPyDsl) => void,
    options?: { nameSanitizer?: NodeNameSanitizer },
  ) {
    super();
    this.nameSanitizer = options?.nameSanitizer ?? safeRuntimeName;
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
    return this.missingRequiredCalls().length === 0;
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
    if (missing.length === 0) return;
    throw new Error(`Function declaration missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.name.toString()) missing.push('name');
    return missing;
  }
}
