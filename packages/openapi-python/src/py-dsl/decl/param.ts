import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

export type ParamDefaultValue = NodeName | py.Expression | undefined;
export type ParamFn = (p: ParamPyDsl) => void;
export type ParamName = NodeName | ParamFn;
export type ParamType = NodeName | py.Expression | undefined;

export type ParamCtor = (name: ParamName, fn?: ParamFn) => ParamPyDsl;

export class ParamPyDsl extends PyDsl<py.FunctionParameter> {
  readonly '~dsl' = 'ParamPyDsl';

  protected _defaultValue?: ParamDefaultValue;
  protected _type?: ParamType;

  constructor(name: ParamName, fn?: ParamFn) {
    super();
    if (typeof name === 'function') {
      name(this);
    } else {
      this.name.set(name);
      fn?.(this);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
    ctx.analyze(this._type);
    ctx.analyze(this._defaultValue);
  }

  /** Sets the parameter default value. */
  default(value: ParamDefaultValue): this {
    this._defaultValue = value;
    return this;
  }

  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /** Sets the parameter type. */
  type(type: ParamType): this {
    this._type = type;
    return this;
  }

  override toAst() {
    this.$validate();
    return py.factory.createFunctionParameter(
      this.name.toString(),
      this.$node(this._type),
      this.$node(this._defaultValue),
    );
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Parameter missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.name.toString()) missing.push('name');
    return missing;
  }
}
