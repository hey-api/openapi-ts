/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ExprMixin } from './mixins/expr';
import { OperatorMixin } from './mixins/operator';
import { TypeExprTsDsl } from './type/expr';
import { TypeQueryTsDsl } from './type/query';
import { TypeOfExprTsDsl } from './typeof';

export class ExprTsDsl extends TsDsl<ts.Expression> {
  private _exprInput: MaybeTsDsl<WithString>;

  constructor(id: MaybeTsDsl<WithString>) {
    super();
    this._exprInput = id;
  }

  returnType(): TypeExprTsDsl {
    return new TypeExprTsDsl('ReturnType').generic(this.typeofType());
  }

  typeofExpr(): TypeOfExprTsDsl {
    return new TypeOfExprTsDsl(this);
  }

  typeofType(): TypeQueryTsDsl {
    return new TypeQueryTsDsl(this);
  }

  $render(): ts.Expression {
    return this.$node(this._exprInput);
  }
}

export interface ExprTsDsl extends ExprMixin, OperatorMixin {}
mixin(ExprTsDsl, ExprMixin, OperatorMixin);
