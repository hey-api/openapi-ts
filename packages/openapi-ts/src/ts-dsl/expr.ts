/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type ts from 'typescript';

import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { AccessMixin } from './mixins/access';
import { mixin } from './mixins/apply';
import { OperatorMixin } from './mixins/operator';

export class ExprTsDsl extends TsDsl<ts.Expression> {
  private input: MaybeTsDsl<ExprInput>;

  constructor(id: MaybeTsDsl<ExprInput>) {
    super();
    this.input = id;
  }

  $render(): ts.Expression {
    return this.$node(this.input);
  }
}

export interface ExprTsDsl extends AccessMixin, OperatorMixin {}
mixin(ExprTsDsl, AccessMixin, OperatorMixin);
