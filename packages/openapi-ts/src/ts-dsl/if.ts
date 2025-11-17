/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DoMixin } from './mixins/do';

export class IfTsDsl extends TsDsl<ts.IfStatement> {
  private _condition?: string | MaybeTsDsl<ts.Expression>;
  private _else?: ReadonlyArray<MaybeTsDsl<ts.Statement>>;

  constructor(condition?: string | MaybeTsDsl<ts.Expression>) {
    super();
    if (condition) this.condition(condition);
  }

  condition(condition: string | MaybeTsDsl<ts.Expression>): this {
    this._condition = condition;
    return this;
  }

  otherwise(...statements: ReadonlyArray<MaybeTsDsl<ts.Statement>>): this {
    this._else = statements;
    return this;
  }

  $render(): ts.IfStatement {
    if (!this._condition) throw new Error('Missing condition in if');

    const thenStmts = this.$do();
    if (!thenStmts.length) throw new Error('Missing then block in if');

    const condition = this.$node(this._condition);
    const thenBlock =
      thenStmts.length === 1
        ? thenStmts[0]!
        : ts.factory.createBlock(thenStmts, true);
    const thenNode = ts.isBlock(thenBlock)
      ? thenBlock
      : ts.factory.createBlock([thenBlock], true);

    let elseNode: ts.Statement | undefined;
    if (this._else) {
      const elseStmts = this.$node(this._else);
      const elseBlock =
        elseStmts.length === 1
          ? elseStmts[0]!
          : ts.factory.createBlock(elseStmts, true);
      elseNode = ts.isBlock(elseBlock)
        ? elseBlock
        : ts.factory.createBlock([elseBlock], true);
    }

    return ts.factory.createIfStatement(condition, thenNode, elseNode);
  }
}

export interface IfTsDsl extends DoMixin {}
mixin(IfTsDsl, DoMixin);
