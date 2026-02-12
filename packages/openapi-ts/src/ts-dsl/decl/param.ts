import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { OptionalMixin } from '../mixins/optional';
import { PatternMixin } from '../mixins/pattern';
import { ValueMixin } from '../mixins/value';
import { TokenTsDsl } from '../token';
import { TypeExprTsDsl } from '../type/expr';

export type ParamCtor = (
  name: NodeName | ((p: ParamTsDsl) => void),
  fn?: (p: ParamTsDsl) => void,
) => ParamTsDsl;

const Mixed = DecoratorMixin(
  OptionalMixin(PatternMixin(ValueMixin(TsDsl<ts.ParameterDeclaration>))),
);

export class ParamTsDsl extends Mixed {
  readonly '~dsl' = 'ParamTsDsl';

  protected _type?: TypeTsDsl;

  constructor(name: NodeName | ((p: ParamTsDsl) => void), fn?: (p: ParamTsDsl) => void) {
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
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /** Sets the parameter type. */
  type(type: string | TypeTsDsl): this {
    this._type = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  override toAst() {
    this.$validate();
    return ts.factory.createParameterDeclaration(
      this.$decorators(),
      undefined,
      this.$pattern() ?? this.name.toString(),
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$type(this._type),
      this.$value(),
    );
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Parameter missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.$pattern() && !this.name.toString())
      missing.push('name or pattern (.array()/.object())');
    return missing;
  }
}
