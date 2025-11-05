/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { AccessMixin } from './mixins/access';
import { mixin } from './mixins/apply';
import { AssignmentMixin } from './mixins/assignment';
import { OperatorMixin } from './mixins/operator';
import { OptionalMixin } from './mixins/optional';

export class AttrTsDsl extends TsDsl<ts.PropertyAccessExpression> {
  private left: MaybeTsDsl<ExprInput>;
  private right: string;

  constructor(left: MaybeTsDsl<ExprInput>, right: string) {
    super();
    this.left = left;
    this.right = right;
  }

  $render(): ts.PropertyAccessExpression {
    const leftNode = this.$node(this.left);
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
