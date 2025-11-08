/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin } from './mixins/access';
import { mixin } from './mixins/apply';
import { AssignmentMixin } from './mixins/assignment';
import { OperatorMixin } from './mixins/operator';
import { OptionalMixin } from './mixins/optional';

export class AttrTsDsl extends TsDsl<
  ts.PropertyAccessExpression | ts.ElementAccessExpression
> {
  private left: MaybeTsDsl<WithString>;
  private right: WithString<number>;

  constructor(left: MaybeTsDsl<WithString>, right: WithString<number>) {
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
        ts.factory.createIdentifier(this.right),
      );
    }
    return ts.factory.createPropertyAccessExpression(
      leftNode,
      ts.factory.createIdentifier(this.right),
    );
  }
}

export interface AttrTsDsl
  extends AccessMixin,
    AssignmentMixin,
    OperatorMixin,
    OptionalMixin {}
mixin(AttrTsDsl, AccessMixin, AssignmentMixin, OperatorMixin, OptionalMixin);
