import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

const Mixed = PyDsl<py.Statement>;

export class StmtPyDsl extends Mixed {
  readonly '~dsl' = 'StmtPyDsl';

  protected _inner: py.Expression | py.Statement | PyDsl<any>;

  constructor(inner: py.Expression | py.Statement | PyDsl<any>) {
    super();
    this._inner = inner;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._inner);
  }

  override toAst() {
    const node = this.$node(this._inner);
    if (isStatement(node)) return node;
    return py.factory.createExpressionStatement(node);
  }
}

/** Checks whether a Python AST node is a statement. */
function isStatement(node: py.Expression | py.Statement): node is py.Statement {
  const statementKinds = new Set([
    py.PyNodeKind.Assignment,
    py.PyNodeKind.AugmentedAssignment,
    py.PyNodeKind.Block,
    py.PyNodeKind.BreakStatement,
    py.PyNodeKind.ClassDeclaration,
    py.PyNodeKind.Comment,
    py.PyNodeKind.ContinueStatement,
    py.PyNodeKind.EmptyStatement,
    py.PyNodeKind.ExpressionStatement,
    py.PyNodeKind.ForStatement,
    py.PyNodeKind.FunctionDeclaration,
    py.PyNodeKind.IfStatement,
    py.PyNodeKind.ImportStatement,
    py.PyNodeKind.RaiseStatement,
    py.PyNodeKind.ReturnStatement,
    py.PyNodeKind.TryStatement,
    py.PyNodeKind.WhileStatement,
    py.PyNodeKind.WithStatement,
  ]);
  return statementKinds.has(node.kind);
}
