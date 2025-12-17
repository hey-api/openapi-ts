import type {
  AnalysisContext,
  AstContext,
  NodeName,
  Ref,
} from '@hey-api/codegen-core';
import { fromRef, isSymbol, ref } from '@hey-api/codegen-core';
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

export type AttrLeft = NodeName | MaybeTsDsl<ts.Expression>;
export type AttrCtor = (left: AttrLeft, right: NodeName) => AttrTsDsl;

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

  constructor(left: AttrLeft, right: NodeName) {
    super();
    this.left = ref(left);
    this.name.set(right);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.left);
    ctx.analyze(this.name);
  }

  override toAst(ctx: AstContext) {
    const leftNode = this.$node(ctx, this.left);
    regexp.typeScriptIdentifier.lastIndex = 0;
    const right = fromRef(this.name);
    if (!regexp.typeScriptIdentifier.test(this.name.toString())) {
      let value = isSymbol(right) ? right.finalName : right;
      if (typeof value === 'string') {
        if (
          (value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))
        ) {
          value = value.slice(1, -1);
        }
      }
      if (this._optional) {
        return ts.factory.createElementAccessChain(
          leftNode,
          this.$node(ctx, new TokenTsDsl().questionDot()),
          this.$node(ctx, new LiteralTsDsl(value)),
        );
      }
      return ts.factory.createElementAccessExpression(
        leftNode,
        this.$node(ctx, new LiteralTsDsl(value)),
      );
    }
    if (this._optional) {
      return ts.factory.createPropertyAccessChain(
        leftNode,
        this.$node(ctx, new TokenTsDsl().questionDot()),
        this.$node(ctx, this.name) as ts.MemberName,
      );
    }
    return ts.factory.createPropertyAccessExpression(
      leftNode,
      this.$node(ctx, this.name) as ts.MemberName,
    );
  }
}

f.attr.set((...args) => new AttrTsDsl(...args));
