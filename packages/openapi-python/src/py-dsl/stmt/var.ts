import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
// import { TypePyDsl } from '../base';
import { PyDsl } from '../base';
// import { DocMixin } from '../mixins/doc';
// import { HintMixin } from '../mixins/hint';
// import { DefaultMixin, ExportMixin } from '../mixins/modifiers';
// import { PatternMixin } from '../mixins/pattern';
import { ValueMixin } from '../mixins/value';
// import { TypeExprPyDsl } from '../type/expr';
import { safeRuntimeName } from '../utils/name';

// const Mixed = DefaultMixin(
//   DocMixin(ExportMixin(HintMixin(PatternMixin(ValueMixin(PyDsl<py.Assignment>))))),
// );
const Mixed = ValueMixin(PyDsl<py.Assignment>);

export class VarPyDsl extends Mixed {
  readonly '~dsl' = 'VarPyDsl';
  override readonly nameSanitizer = safeRuntimeName;

  // protected _type?: TypePyDsl;

  constructor(name?: NodeName) {
    super();
    if (name) this.name.set(name);
    if (isSymbol(name)) {
      name.setKind('var');
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
    // ctx.analyze(this._type);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  // /** Sets the variable type annotation. */
  // type(type: string | TypePyDsl): this {
  //   this._type = type instanceof TypePyDsl ? type : new TypeExprPyDsl(type);
  //   return this;
  // }

  override toAst() {
    this.$validate();
    return py.factory.createAssignment(this.$node(this.name)!, this.$value()!);
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Variable assignment missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.$node(this.name)) missing.push('name');
    if (!this.$value()) missing.push('.value()');
    return missing;
  }
}
