import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { validTypescriptIdentifierRegExp } from '~/utils/regexp';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin, setAttrFactory } from '../mixins/expr';
import { OperatorMixin } from '../mixins/operator';
import { OptionalMixin } from '../mixins/optional';
import { TokenTsDsl } from '../token';
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
  protected left: AttrLeft;
  protected right: AttrRight;

  constructor(left: AttrLeft, right: AttrRight) {
    super();
    this.left = left;
    this.right = right;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.left)) {
      ctx.addDependency(this.left);
    } else if (isTsDsl(this.left)) {
      this.left.analyze(ctx);
    }
    if (isSymbol(this.right)) ctx.addDependency(this.right);
  }

  protected override _render() {
    const leftNode = this.$node(this.left);
    validTypescriptIdentifierRegExp.lastIndex = 0;
    if (
      typeof this.right === 'number' ||
      (typeof this.right === 'string' &&
        !validTypescriptIdentifierRegExp.test(this.right))
    ) {
      if (this._optional) {
        return ts.factory.createElementAccessChain(
          leftNode,
          this.$node(new TokenTsDsl().questionDot()),
          this.$node(new LiteralTsDsl(this.right)),
        );
      }
      return ts.factory.createElementAccessExpression(
        leftNode,
        this.$node(new LiteralTsDsl(this.right)),
      );
    }
    if (this._optional) {
      return ts.factory.createPropertyAccessChain(
        leftNode,
        this.$node(new TokenTsDsl().questionDot()),
        // @ts-expect-error ts.MemberName is not properly recognized here
        this.$node(this.right),
      );
    }
    return ts.factory.createPropertyAccessExpression(
      leftNode,
      // @ts-expect-error ts.MemberName is not properly recognized here
      this.$node(this.right),
    );
  }
}

setAttrFactory((...args) => new AttrTsDsl(...args));
