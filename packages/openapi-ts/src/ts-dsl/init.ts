/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import {
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
} from './mixins/modifiers';
import { ParamMixin } from './mixins/param';

export class InitTsDsl extends TsDsl<ts.ConstructorDeclaration> {
  private body: Array<MaybeTsDsl<ts.Statement | ts.Expression>> = [];
  private modifiers = createModifierAccessor(this);

  constructor(fn?: (i: InitTsDsl) => void) {
    super();
    fn?.(this);
  }

  /** Adds one or more statements or expressions to the constructor body. */
  do(...items: ReadonlyArray<MaybeTsDsl<ts.Statement | ts.Expression>>): this {
    this.body.push(...items);
    return this;
  }

  /** Builds the `ConstructorDeclaration` node. */
  $render(): ts.ConstructorDeclaration {
    const builtParams = this.$node(this._params ?? []);
    const builtBody = this.$stmt(this.body);
    return ts.factory.createConstructorDeclaration(
      [...(this.decorators ?? []), ...this.modifiers.list()],
      builtParams,
      ts.factory.createBlock(builtBody, true),
    );
  }
}

export interface InitTsDsl
  extends DecoratorMixin,
    DescribeMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin {}
mixin(
  InitTsDsl,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
);
