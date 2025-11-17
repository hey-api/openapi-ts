/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { OptionalMixin } from './mixins/optional';
import { PatternMixin } from './mixins/pattern';
import { ValueMixin } from './mixins/value';
import { TypeExprTsDsl } from './type/expr';

export class ParamTsDsl extends TsDsl<ts.ParameterDeclaration> {
  private name?: string;
  private _type?: TypeTsDsl;

  constructor(
    name: string | ((p: ParamTsDsl) => void),
    fn?: (p: ParamTsDsl) => void,
  ) {
    super();
    if (typeof name === 'string') {
      this.name = name;
      fn?.(this);
    } else {
      name(this);
    }
  }

  /** Sets the parameter type. */
  type(type: string | TypeTsDsl): this {
    this._type = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  $render(): ts.ParameterDeclaration {
    const name = this.$pattern() ?? this.name;
    if (!name)
      throw new Error(
        'Param must have either a name or a destructuring pattern',
      );
    return ts.factory.createParameterDeclaration(
      this.$decorators(),
      undefined,
      name,
      this.questionToken,
      this.$type(this._type),
      this.$value(),
    );
  }
}

export interface ParamTsDsl
  extends DecoratorMixin,
    OptionalMixin,
    PatternMixin,
    ValueMixin {}
mixin(ParamTsDsl, DecoratorMixin, OptionalMixin, PatternMixin, ValueMixin);
