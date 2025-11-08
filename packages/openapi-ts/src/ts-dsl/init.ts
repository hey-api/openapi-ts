/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import { DoMixin } from './mixins/do';
import {
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
} from './mixins/modifiers';
import { ParamMixin } from './mixins/param';

export class InitTsDsl extends TsDsl<ts.ConstructorDeclaration> {
  private modifiers = createModifierAccessor(this);

  constructor(fn?: (i: InitTsDsl) => void) {
    super();
    fn?.(this);
  }

  /** Builds the `ConstructorDeclaration` node. */
  $render(): ts.ConstructorDeclaration {
    return ts.factory.createConstructorDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      this.$params(),
      ts.factory.createBlock(this.$do(), true),
    );
  }
}

export interface InitTsDsl
  extends DecoratorMixin,
    DescribeMixin,
    DoMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin {}
mixin(
  InitTsDsl,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  DoMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
);
