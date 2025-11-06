/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { GenericsMixin } from './mixins/generics';

export class NewTsDsl extends TsDsl<ts.NewExpression> {
  private classExpr: MaybeTsDsl<ExprInput>;
  private argList: Array<MaybeTsDsl<ExprInput>> = [];

  constructor(
    classExpr: MaybeTsDsl<ExprInput>,
    ...args: ReadonlyArray<MaybeTsDsl<ExprInput>>
  ) {
    super();
    this.classExpr = classExpr;
    if (args.length) this.argList = [...args];
  }

  /** Adds constructor arguments. */
  args(...args: ReadonlyArray<MaybeTsDsl<ExprInput>>): this {
    this.argList = [...args];
    return this;
  }

  /** Builds the `NewExpression` node. */
  $render(): ts.NewExpression {
    const classExprNode = this.$node(this.classExpr);
    const argListNodes = this.$node(this.argList).map((arg) => this.$expr(arg));
    const builtTypes = this._generics?.map((arg) => this.$type(arg));
    return ts.factory.createNewExpression(
      classExprNode,
      // @ts-expect-error --- generics are not officially supported on 'new' expressions yet
      builtTypes,
      argListNodes,
    );
  }
}

export interface NewTsDsl extends GenericsMixin {}
mixin(NewTsDsl, GenericsMixin);
