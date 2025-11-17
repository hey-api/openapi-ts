/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
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
    if (typeof this.right === 'number') {
      if (this.isOptional) {
        return ts.factory.createElementAccessChain(
          leftNode,
          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
          ts.factory.createNumericLiteral(this.right),
        );
      }
      return ts.factory.createElementAccessExpression(
        leftNode,
        ts.factory.createNumericLiteral(this.right),
      );
    }
    if (this.isOptional) {
      return ts.factory.createPropertyAccessChain(
        leftNode,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
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
  extends AssignmentMixin,
    ExprMixin,
    OperatorMixin,
    OptionalMixin {}
mixin(AttrTsDsl, AssignmentMixin, ExprMixin, OperatorMixin, OptionalMixin);

registerLazyAccessAttrFactory((expr, name) => new AttrTsDsl(expr, name));
