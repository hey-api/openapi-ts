import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { validTypescriptIdentifierRegExp } from '~/utils/regexp';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin, registerLazyAccessAttrFactory } from '../mixins/expr';
import { OperatorMixin } from '../mixins/operator';
import { OptionalMixin } from '../mixins/optional';
import { TokenTsDsl } from '../token';
import { LiteralTsDsl } from './literal';

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
  protected left: string | MaybeTsDsl<ts.Expression>;
  protected right: string | ts.MemberName | number;

  constructor(
    left: string | MaybeTsDsl<ts.Expression>,
    right: string | ts.MemberName | number,
  ) {
    super();
    this.left = left;
    this.right = right;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
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
        this.$maybeId(this.right),
      );
    }
    return ts.factory.createPropertyAccessExpression(
      leftNode,
      this.$maybeId(this.right),
    );
  }
}

registerLazyAccessAttrFactory((...args) => new AttrTsDsl(...args));
