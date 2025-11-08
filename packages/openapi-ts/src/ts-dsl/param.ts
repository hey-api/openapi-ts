/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { OptionalMixin } from './mixins/optional';
import { PatternMixin } from './mixins/pattern';
import { createTypeAccessor } from './mixins/type';
import { ValueMixin } from './mixins/value';

export class ParamTsDsl extends TsDsl<ts.ParameterDeclaration> {
  private name?: string;
  private _type = createTypeAccessor(this);

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

  /** Sets the parameter's type. */
  type = this._type.fn;

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
      this._type.$render(),
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
