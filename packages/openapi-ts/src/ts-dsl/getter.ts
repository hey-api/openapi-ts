/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import { DoMixin } from './mixins/do';
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

export class GetterTsDsl extends TsDsl<ts.GetAccessorDeclaration> {
  private modifiers = createModifierAccessor(this);
  private name: string;

  constructor(name: string, fn?: (g: GetterTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  $render(): ts.GetAccessorDeclaration {
    return ts.factory.createGetAccessorDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      this.name,
      this.$params(),
      undefined,
      ts.factory.createBlock(this.$do(), true),
    );
  }
}

export interface GetterTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DescribeMixin,
    DoMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin {}
mixin(
  GetterTsDsl,
  AbstractMixin,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  DoMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
);
