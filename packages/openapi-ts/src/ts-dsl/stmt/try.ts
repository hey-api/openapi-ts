import type {
  AnalysisContext,
  AstContext,
  NodeName,
} from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
import type { DoExpr } from '../mixins/do';
import { BlockTsDsl } from './block';

const Mixed = TsDsl<ts.TryStatement>;

export class TryTsDsl extends Mixed {
  readonly '~dsl' = 'TryTsDsl';

  protected _catch?: Array<DoExpr>;
  protected _catchArg?: NodeName;
  protected _finally?: Array<DoExpr>;
  protected _try?: Array<DoExpr>;

  constructor(...tryBlock: Array<DoExpr>) {
    super();
    this.try(...tryBlock);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);

    if (this._try) {
      ctx.pushScope();
      try {
        for (const stmt of this._try) ctx.analyze(stmt);
      } finally {
        ctx.popScope();
      }
    }

    if (this._catch || this._catchArg) {
      ctx.pushScope();
      try {
        ctx.analyze(this._catchArg);
        if (this._catch) {
          for (const stmt of this._catch) ctx.analyze(stmt);
        }
      } finally {
        ctx.popScope();
      }
    }

    if (this._finally) {
      ctx.pushScope();
      try {
        for (const stmt of this._finally) ctx.analyze(stmt);
      } finally {
        ctx.popScope();
      }
    }
  }

  catch(...items: Array<DoExpr>): this {
    this._catch = items;
    return this;
  }

  catchArg(arg: NodeName): this {
    this._catchArg = arg;
    return this;
  }

  finally(...items: Array<DoExpr>): this {
    this._finally = items;
    return this;
  }

  try(...items: Array<DoExpr>): this {
    this._try = items;
    return this;
  }

  override toAst(ctx: AstContext) {
    if (!this._try?.length) throw new Error('Missing try block');

    const catchParam = this._catchArg
      ? (this.$node(ctx, this._catchArg) as ts.BindingName)
      : undefined;

    return ts.factory.createTryStatement(
      this.$node(ctx, new BlockTsDsl(...this._try).pretty()),
      ts.factory.createCatchClause(
        catchParam
          ? ts.factory.createVariableDeclaration(catchParam)
          : undefined,
        this.$node(ctx, new BlockTsDsl(...(this._catch ?? [])).pretty()),
      ),
      this._finally
        ? this.$node(ctx, new BlockTsDsl(...this._finally).pretty())
        : undefined,
    );
  }
}
