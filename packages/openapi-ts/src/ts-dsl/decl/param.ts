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

  constructor(
    name: NodeName | ((p: ParamTsDsl) => void),
    fn?: (p: ParamTsDsl) => void,
  ) {
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

  /** Sets the parameter type. */
  type(type: string | TypeTsDsl): this {
    this._type = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  override toAst() {
    const name = this.$pattern() || this.name.toString();
    if (!name) {
      throw new Error(
        'Param must have either a name or a destructuring pattern',
      );
    }
    return ts.factory.createParameterDeclaration(
      this.$decorators(),
      undefined,
      name,
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$type(this._type),
      this.$value(),
    );
  }
}
