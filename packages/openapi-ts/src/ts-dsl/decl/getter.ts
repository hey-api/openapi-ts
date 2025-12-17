import type {
  AnalysisContext,
  AstContext,
  NodeName,
  NodeRole,
} from '@hey-api/codegen-core';
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
import { ParamMixin } from '../mixins/param';
import { TypeReturnsMixin } from '../mixins/type-returns';
import { BlockTsDsl } from '../stmt/block';
import { safeAccessorName } from '../utils/name';

const Mixed = AbstractMixin(
  AsyncMixin(
    DecoratorMixin(
      DoMixin(
        DocMixin(
          ParamMixin(
            PrivateMixin(
              ProtectedMixin(
                PublicMixin(
                  StaticMixin(
                    TypeReturnsMixin(TsDsl<ts.GetAccessorDeclaration>),
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

export class GetterTsDsl extends Mixed {
  readonly '~dsl' = 'GetterTsDsl';
  override readonly nameSanitizer = safeAccessorName;
  override role?: NodeRole = 'accessor';

  constructor(name: NodeName, fn?: (g: GetterTsDsl) => void) {
    super();
    this.name.set(name);
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
    const node = ts.factory.createGetAccessorDeclaration(
      [...this.$decorators(ctx), ...this.modifiers],
      this.$node(ctx, this.name) as ts.PropertyName,
      this.$params(ctx),
      this.$returns(ctx),
      this.$node(ctx, new BlockTsDsl(...this._do).pretty()),
    );
    return this.$docs(ctx, node);
  }
}
