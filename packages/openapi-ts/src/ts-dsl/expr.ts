/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { AccessMixin } from './mixins/access';
import { mixin } from './mixins/apply';
import { OperatorMixin } from './mixins/operator';
import { TypeExprTsDsl } from './type/expr';
import { TypeQueryTsDsl } from './type/query';

export class ExprTsDsl extends TsDsl<ts.Expression> {
  private _exprInput: MaybeTsDsl<WithString>;

  constructor(id: MaybeTsDsl<WithString>) {
    super();
    this._exprInput = id;
  }

  typeof(): TypeQueryTsDsl {
    return new TypeQueryTsDsl(this);
  }

  returnType(): TypeExprTsDsl {
    return new TypeExprTsDsl('ReturnType').generic(this.typeof());
  }

  $render(): ts.Expression {
    return this.$node(this._exprInput);
  }
}

export interface ExprTsDsl extends AccessMixin, OperatorMixin {}
mixin(ExprTsDsl, AccessMixin, OperatorMixin);
