import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import { PyDsl } from '../base';
import { ValueMixin } from '../mixins/value';
import { safeKeywordName } from '../utils/name';

const Mixed = ValueMixin(PyDsl<py.Assignment>);

export type FieldType = NodeName | PyDsl<py.Expression>;

export class FieldPyDsl extends Mixed {
  readonly '~dsl' = 'FieldPyDsl';
  override readonly nameSanitizer = safeKeywordName;

  protected _type?: Ref<FieldType>;

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
    return !this.missingRequiredCalls().length;
  }

  /** Sets the type annotation for the field. */
  type(type: FieldType): this {
    this._type = ref(type);
    return this;
  }

  override toAst() {
    this.$validate();
    const target = this.$node(this.name)!;
    const type = this.$type();
    const value = this.$value();

    return py.factory.createAssignment(target, type, value);
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (!missing.length) return;
    throw new Error(`Field declaration missing ${missing.join(' and ')}`);
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
