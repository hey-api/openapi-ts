/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
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
  private body: Array<MaybeTsDsl<ts.Statement | ts.Expression>> = [];
  private modifiers = createModifierAccessor(this);
  private name: string;

  constructor(name: string, fn?: (s: SetterTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  /** Adds one or more expressions/statements to the setter body. */
  do(...items: ReadonlyArray<MaybeTsDsl<ts.Statement | ts.Expression>>): this {
    this.body.push(...items);
    return this;
  }

  $render(): ts.SetAccessorDeclaration {
    const builtParams = this.$node(this._params ?? []);
    const builtBody = this.$stmt(this.body);
    return ts.factory.createSetAccessorDeclaration(
      [...(this.decorators ?? []), ...this.modifiers.list()],
      this.name,
      builtParams,
      ts.factory.createBlock(builtBody, true),
    );
  }
}

export interface SetterTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DescribeMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin {}
mixin(
  SetterTsDsl,
  AbstractMixin,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
);
