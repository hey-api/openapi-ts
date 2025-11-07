/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { OptionalMixin } from './mixins/optional';
import { createTypeAccessor } from './mixins/type';
import { ValueMixin } from './mixins/value';

export class ParamTsDsl extends TsDsl<ts.ParameterDeclaration> {
  private name: string;
  private _type = createTypeAccessor(this);

  constructor(name: string, fn?: (p: ParamTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  /** Sets the parameter's type. */
  type = this._type.method;

  $render(): ts.ParameterDeclaration {
    return ts.factory.createParameterDeclaration(
      this.decorators,
      undefined,
      ts.factory.createIdentifier(this.name),
      this.questionToken,
      this._type.$render(),
      this.$node(this.initializer),
    );
  }
}

export interface ParamTsDsl extends DecoratorMixin, OptionalMixin, ValueMixin {}
mixin(ParamTsDsl, DecoratorMixin, OptionalMixin, ValueMixin);
