/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DoMixin } from './mixins/do';
import { DocMixin } from './mixins/doc';
import type { AsyncMixin } from './mixins/modifiers';
import {
  AbstractMixin,
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from './mixins/modifiers';
import { ParamMixin } from './mixins/param';

export class SetterTsDsl extends TsDsl<ts.SetAccessorDeclaration> {
  private modifiers = createModifierAccessor(this);
  private name: string;

  constructor(name: string, fn?: (s: SetterTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  $render(): ts.SetAccessorDeclaration {
    return ts.factory.createSetAccessorDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      this.name,
      this.$params(),
      ts.factory.createBlock(this.$do(), true),
    );
  }
}

export interface SetterTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DoMixin,
    DocMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin {}
mixin(
  SetterTsDsl,
  AbstractMixin,
  DecoratorMixin,
  DoMixin,
  [DocMixin, { overrideRender: true }],
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
);
