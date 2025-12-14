import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { fromRef, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { OperatorMixin } from '../mixins/operator';
import { OptionalMixin } from '../mixins/optional';
import { TokenTsDsl } from '../token';
import { f } from '../utils/factories';
import { regexp } from '../utils/regexp';
import { LiteralTsDsl } from './literal';

export type AttrLeft = Symbol | string | MaybeTsDsl<ts.Expression>;
export type AttrRight = Symbol | string | ts.MemberName | number;
export type AttrCtor = (left: AttrLeft, right: AttrRight) => AttrTsDsl;

const Mixed = AsMixin(
  ExprMixin(
    OperatorMixin(
      OptionalMixin(
        TsDsl<ts.PropertyAccessExpression | ts.ElementAccessExpression>,
      ),
    ),
  ),
);

export class AttrTsDsl extends Mixed {
  readonly '~dsl' = 'AttrTsDsl';

  protected left: Ref<AttrLeft>;
  protected right: Ref<AttrRight>;

  constructor(left: AttrLeft, right: AttrRight) {
    super();
    this.left = ref(left);
    this.right = ref(right);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.left);
    ctx.analyze(this.right);
  }

  override toAst(ctx: AstContext) {
    const leftNode = this.$node(ctx, this.left);
    regexp.typeScriptIdentifier.lastIndex = 0;
    if (
      typeof fromRef(this.right) === 'number' ||
      (typeof fromRef(this.right) === 'string' &&
        !regexp.typeScriptIdentifier.test(fromRef(this.right) as string))
    ) {
      if (this._optional) {
        return ts.factory.createElementAccessChain(
          leftNode,
          this.$node(ctx, new TokenTsDsl().questionDot()),
          this.$node(ctx, new LiteralTsDsl(fromRef(this.right) as string)),
        );
      }
      return ts.factory.createElementAccessExpression(
        leftNode,
        this.$node(ctx, new LiteralTsDsl(fromRef(this.right) as string)),
      );
    }
    if (this._optional) {
      return ts.factory.createPropertyAccessChain(
        leftNode,
        this.$node(ctx, new TokenTsDsl().questionDot()),
        this.$node(ctx, this.right) as ts.MemberName,
      );
    }
    return ts.factory.createPropertyAccessExpression(
      leftNode,
      this.$node(ctx, this.right) as ts.MemberName,
    );
  }
}

f.attr.set((...args) => new AttrTsDsl(...args));
