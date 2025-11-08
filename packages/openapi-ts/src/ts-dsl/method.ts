/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import { DoMixin } from './mixins/do';
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
  private modifiers = createModifierAccessor(this);
  private name: string;
  private _returns = createTypeAccessor(this);

  constructor(name: string, fn?: (m: MethodTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  /** Sets the return type. */
  returns = this._returns.fn;

  /** Builds the `MethodDeclaration` node. */
  $render(): ts.MethodDeclaration {
    return ts.factory.createMethodDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      undefined,
      ts.factory.createIdentifier(this.name),
      this.questionToken,
      this.$generics(),
      this.$params(),
      this._returns.$render(),
      ts.factory.createBlock(this.$do(), true),
    );
  }
}

export interface MethodTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DescribeMixin,
    DoMixin,
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
  DoMixin,
  GenericsMixin,
  OptionalMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
);
