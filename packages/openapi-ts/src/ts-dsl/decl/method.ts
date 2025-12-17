import type {
  AnalysisContext,
  AstContext,
  NodeName,
  NodeRole,
} from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
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
import { TypeReturnsMixin } from '../mixins/type-returns';
import { BlockTsDsl } from '../stmt/block';
import { TokenTsDsl } from '../token';
import { safeAccessorName } from '../utils/name';

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
                    StaticMixin(
                      TypeParamsMixin(
                        TypeReturnsMixin(TsDsl<ts.MethodDeclaration>),
                      ),
                    ),
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
  override readonly nameSanitizer = safeAccessorName;
  override role?: NodeRole = 'accessor';

  constructor(name: NodeName, fn?: (m: MethodTsDsl) => void) {
    super();
    this.name.set(name);
    if (isSymbol(name)) {
      name.setNode(this);
    }
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    ctx.analyze(this.name);

    ctx.pushScope();
    try {
      super.analyze(ctx);
    } finally {
      ctx.popScope();
    }
  }

  override toAst(ctx: AstContext) {
    const node = ts.factory.createMethodDeclaration(
      [...this.$decorators(ctx), ...this.modifiers],
      undefined,
      this.$node(ctx, this.name) as ts.PropertyName,
      this._optional ? this.$node(ctx, new TokenTsDsl().optional()) : undefined,
      this.$generics(ctx),
      this.$params(ctx),
      this.$returns(ctx),
      this.$node(ctx, new BlockTsDsl(...this._do).pretty()),
    );
    return this.$docs(ctx, node);
  }
}
