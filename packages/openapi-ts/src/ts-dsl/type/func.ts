import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ParamMixin } from '../mixins/param';
import { TypeParamsMixin } from '../mixins/type-params';
import { TypeExprTsDsl } from './expr';

const Mixed = DocMixin(
  ParamMixin(TypeParamsMixin(TypeTsDsl<ts.FunctionTypeNode>)),
);

export class TypeFuncTsDsl extends Mixed {
  readonly '~dsl' = 'TypeFuncTsDsl';

  protected _returns?: TypeTsDsl;

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._returns);
  }

  /** Sets the return type. */
  returns(type: string | TypeTsDsl): this {
    this._returns = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  override toAst() {
    if (this._returns === undefined) {
      throw new Error('Missing return type in function type DSL');
    }
    const node = ts.factory.createFunctionTypeNode(
      this.$generics(),
      this.$params(),
      this.$type(this._returns),
    );
    return this.$docs(node);
  }
}
