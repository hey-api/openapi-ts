import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import {
  AbstractMixin,
  AsyncMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { OptionalMixin } from '../mixins/optional';
import { ParamMixin } from '../mixins/param';
import { TypeParamsMixin } from '../mixins/type-params';
import { BlockTsDsl } from '../stmt/block';
import { TokenTsDsl } from '../token';
import { TypeExprTsDsl } from '../type/expr';

const Mixed = AbstractMixin(
  AsyncMixin(
    DecoratorMixin(
      DoMixin(
        DocMixin(
          OptionalMixin(
            ParamMixin(
              PrivateMixin(
                ProtectedMixin(
                  PublicMixin(
                    StaticMixin(TypeParamsMixin(TsDsl<ts.MethodDeclaration>)),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);

export class MethodTsDsl extends Mixed {
  readonly '~dsl' = 'MethodTsDsl';

  protected name: string;
  protected _returns?: TypeTsDsl;

  constructor(name: string, fn?: (m: MethodTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    ctx.pushScope();
    try {
      super.analyze(ctx);
      ctx.analyze(this._returns);
    } finally {
      ctx.popScope();
    }
  }

  /** Sets the return type. */
  returns(type: string | TypeTsDsl): this {
    this._returns = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  override toAst() {
    const node = ts.factory.createMethodDeclaration(
      [...this.$decorators(), ...this.modifiers],
      undefined,
      this.name,
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$generics(),
      this.$params(),
      this.$type(this._returns),
      this.$node(new BlockTsDsl(...this._do).pretty()),
    );
    return this.$docs(node);
  }
}
