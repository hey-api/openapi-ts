import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import { LayoutMixin } from '../mixins/layout';
import { AsyncMixin, ModifiersMixin } from '../mixins/modifiers';
import { safeRuntimeName } from '../utils/name';

const Mixed = DecoratorMixin(
  DocMixin(DoMixin(LayoutMixin(AsyncMixin(ModifiersMixin(PyDsl<py.FunctionDeclaration>))))),
);

export class FuncPyDsl extends Mixed {
  readonly '~dsl' = 'FuncPyDsl';
  override readonly nameSanitizer = safeRuntimeName;

  protected _parameters: Array<py.FunctionParameter> = [];
  protected _returnType?: py.Expression;

  constructor(name: NodeName, fn?: (f: FuncPyDsl) => void) {
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
    for (const param of this._parameters) {
      ctx.analyze(param);
    }
    ctx.analyze(this._returnType);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  param(name: string, configure?: (p: py.FunctionParameter) => void): this {
    const param = py.factory.createFunctionParameter(name, undefined, undefined, undefined);
    if (configure) configure(param);
    this._parameters.push(param);
    return this;
  }

  returns(returnType: string | py.Expression): this {
    this._returnType =
      typeof returnType === 'string' ? py.factory.createIdentifier(returnType) : returnType;
    return this;
  }

  override toAst() {
    this.$validate();
    return py.factory.createFunctionDeclaration(
      this.name.toString(),
      this._parameters,
      this.$node(this._returnType),
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
