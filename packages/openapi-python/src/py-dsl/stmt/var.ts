import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';
import { ValueMixin } from '../mixins/value';
import { safeRuntimeName } from '../utils/name';

const Mixed = ValueMixin(PyDsl<py.Assignment>);

export type VarType = NodeName | PyDsl<py.Expression>;

export class VarPyDsl extends Mixed {
  readonly '~dsl' = 'VarPyDsl';
  override readonly nameSanitizer = safeRuntimeName;

  protected _type?: VarType;

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
    ctx.analyze(this._type);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /** Sets the type annotation for the variable. */
  type(type: VarType): this {
    this._type = type;
    return this;
  }

  override toAst() {
    this.$validate();
    const target = this.$node(this.name)!;
    const annotation = this.$type();
    const value = this.$value();

    return py.factory.createAssignment(target, annotation, value);
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Variable assignment missing ${missing.join(' and ')}`);
  }

  protected $type(): py.Expression | undefined {
    return this.$node(this._type);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.$node(this.name)) missing.push('name');
    const hasAnnotation = this.$type();
    const hasValue = this.$value();
    if (!hasAnnotation && !hasValue) {
      missing.push('.type() or .assign()');
    }
    return missing;
  }
}
