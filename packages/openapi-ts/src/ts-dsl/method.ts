/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from './base';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DoMixin } from './mixins/do';
import { DocMixin } from './mixins/doc';
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
import { TypeParamsMixin } from './mixins/type-params';
import { TypeExprTsDsl } from './type/expr';

export class MethodTsDsl extends TsDsl<ts.MethodDeclaration> {
  private modifiers = createModifierAccessor(this);
  private name: string;
  private _returns?: TypeTsDsl;

  constructor(name: string, fn?: (m: MethodTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  /** Sets the return type. */
  returns(type: string | TypeTsDsl): this {
    this._returns = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  /** Builds the `MethodDeclaration` node. */
  $render(): ts.MethodDeclaration {
    return ts.factory.createMethodDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      undefined,
      this.$expr(this.name),
      this.questionToken,
      this.$generics(),
      this.$params(),
      this.$type(this._returns),
      ts.factory.createBlock(this.$do(), true),
    );
  }
}

export interface MethodTsDsl
  extends AbstractMixin,
    AsyncMixin,
    DecoratorMixin,
    DoMixin,
    DocMixin,
    OptionalMixin,
    ParamMixin,
    PrivateMixin,
    ProtectedMixin,
    PublicMixin,
    StaticMixin,
    TypeParamsMixin {}
mixin(
  MethodTsDsl,
  AbstractMixin,
  AsyncMixin,
  DecoratorMixin,
  DoMixin,
  [DocMixin, { overrideRender: true }],
  OptionalMixin,
  ParamMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
  TypeParamsMixin,
);
