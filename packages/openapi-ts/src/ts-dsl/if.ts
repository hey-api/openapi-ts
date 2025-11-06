import ts from 'typescript';

import type { ExprInput, MaybeTsDsl } from './base';
import { TsDsl } from './base';

export class IfTsDsl extends TsDsl<ts.IfStatement> {
  private conditionInput?: MaybeTsDsl<ExprInput>;
  private thenInput?: ReadonlyArray<MaybeTsDsl<ts.Statement>>;
  private elseInput?: ReadonlyArray<MaybeTsDsl<ts.Statement>>;

  constructor(condition?: MaybeTsDsl<ExprInput>) {
    super();
    if (condition) this.condition(condition);
  }

  condition(condition: MaybeTsDsl<ExprInput>): this {
    this.conditionInput = condition;
    return this;
  }

  do(...items: ReadonlyArray<MaybeTsDsl<ts.Statement>>): this {
    this.thenInput = items;
    return this;
  }

  otherwise(...statements: ReadonlyArray<MaybeTsDsl<ts.Statement>>): this {
    this.elseInput = statements;
    return this;
  }

  $render(): ts.IfStatement {
    if (!this.conditionInput) throw new Error('Missing condition in if');
    if (!this.thenInput) throw new Error('Missing then block in if');

    const condition = this.$node(this.conditionInput);

    const thenStmts = this.$node(this.thenInput);
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
