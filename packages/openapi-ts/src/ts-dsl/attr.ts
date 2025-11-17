/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { validTypescriptIdentifierRegExp } from '~/utils/regexp';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { LiteralTsDsl } from './literal';
import { mixin } from './mixins/apply';
import { AsMixin } from './mixins/as';
import { AssignmentMixin } from './mixins/assignment';
import { ExprMixin, registerLazyAccessAttrFactory } from './mixins/expr';
import { OperatorMixin } from './mixins/operator';
import { OptionalMixin } from './mixins/optional';

export class AttrTsDsl extends TsDsl<
  ts.PropertyAccessExpression | ts.ElementAccessExpression
> {
  private left: string | MaybeTsDsl<ts.Expression>;
  private right: string | ts.MemberName | number;

  constructor(
    left: string | MaybeTsDsl<ts.Expression>,
    right: string | ts.MemberName | number,
  ) {
    super();
    this.left = left;
    this.right = right;
  }

  $render(): ts.PropertyAccessExpression | ts.ElementAccessExpression {
    const leftNode = this.$node(this.left);
    validTypescriptIdentifierRegExp.lastIndex = 0;
    const questionToken = this.isOptional
      ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
      : undefined;
    if (
      typeof this.right === 'number' ||
      (typeof this.right === 'string' &&
        !validTypescriptIdentifierRegExp.test(this.right))
    ) {
      if (questionToken) {
        return ts.factory.createElementAccessChain(
          leftNode,
          questionToken,
          this.$node(new LiteralTsDsl(this.right)),
        );
      }
      return ts.factory.createElementAccessExpression(
        leftNode,
        this.$node(new LiteralTsDsl(this.right)),
      );
    }
    if (questionToken) {
      return ts.factory.createPropertyAccessChain(
        leftNode,
        questionToken,
        this.$maybeId(this.right),
      );
    }
    return ts.factory.createPropertyAccessExpression(
      leftNode,
      this.$maybeId(this.right),
    );
  }
}

export interface AttrTsDsl
  extends AsMixin,
    AssignmentMixin,
    ExprMixin,
    OperatorMixin,
    OptionalMixin {}
mixin(
  AttrTsDsl,
  AsMixin,
  AssignmentMixin,
  ExprMixin,
  OperatorMixin,
  OptionalMixin,
);

registerLazyAccessAttrFactory((...args) => new AttrTsDsl(...args));
