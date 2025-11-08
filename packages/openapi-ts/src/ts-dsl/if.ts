/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DoMixin } from './mixins/do';

export class IfTsDsl extends TsDsl<ts.IfStatement> {
  private conditionInput?: MaybeTsDsl<WithString>;
  private elseInput?: ReadonlyArray<MaybeTsDsl<ts.Statement>>;

  constructor(condition?: MaybeTsDsl<WithString>) {
    super();
    if (condition) this.condition(condition);
  }

  condition(condition: MaybeTsDsl<WithString>): this {
    this.conditionInput = condition;
    return this;
  }

  otherwise(...statements: ReadonlyArray<MaybeTsDsl<ts.Statement>>): this {
    this.elseInput = statements;
    return this;
  }

  $render(): ts.IfStatement {
    if (!this.conditionInput) throw new Error('Missing condition in if');

    const thenStmts = this.$do();
    if (!thenStmts.length) throw new Error('Missing then block in if');

    const condition = this.$node(this.conditionInput);
    const thenBlock =
      thenStmts.length === 1
        ? thenStmts[0]!
        : ts.factory.createBlock(thenStmts, true);
    const thenNode = ts.isBlock(thenBlock)
      ? thenBlock
      : ts.factory.createBlock([thenBlock], true);

    let elseNode: ts.Statement | undefined;
    if (this.elseInput) {
      const elseStmts = this.$node(this.elseInput);
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
