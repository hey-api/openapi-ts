/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import { GenericsMixin } from './mixins/generics';
import {
  AbstractMixin,
  AsyncMixin,
  createModifierAccessor,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from './mixins/modifiers';
import { OptionalMixin } from './mixins/optional';
import { ParamMixin } from './mixins/param';
import { createTypeAccessor } from './mixins/type';

export class MethodTsDsl extends TsDsl<ts.MethodDeclaration> {
  private body: Array<MaybeTsDsl<ts.Statement | ts.Expression>> = [];
  private modifiers = createModifierAccessor(this);
  private name: string;
  private _returns = createTypeAccessor(this);

  constructor(name: string, fn?: (m: MethodTsDsl) => void) {
    super();
    this.name = name;
    if (fn) fn(this);
  }

  /** Sets the return type. */
  returns = this._returns.method;

  /** Adds one or more statements or expressions to the method body. */
  do(...items: ReadonlyArray<MaybeTsDsl<ts.Statement | ts.Expression>>): this {
    this.body.push(...items);
    return this;
  }

  /** Builds the `MethodDeclaration` node. */
  $render(): ts.MethodDeclaration {
    const builtParams = this.$node(this._params ?? []);
    const builtBody = this.$stmt(this.body);
    return ts.factory.createMethodDeclaration(
      [...(this.decorators ?? []), ...this.modifiers.list()],
      undefined,
      ts.factory.createIdentifier(this.name),
      this.questionToken,
      this.$generics(),
      builtParams,
      this._returns.$render(),
      ts.factory.createBlock(builtBody, true),
    );
  }
}

export interface MethodTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DescribeMixin,
    GenericsMixin,
    OptionalMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin {}
mixin(
  MethodTsDsl,
  AbstractMixin,
  AsyncMixin,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  GenericsMixin,
  OptionalMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
);
