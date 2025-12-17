import type {
  AnalysisContext,
  AstContext,
  NodeScope,
} from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ParamMixin } from '../mixins/param';
import { TypeParamsMixin } from '../mixins/type-params';
import { TypeReturnsMixin } from '../mixins/type-returns';

const Mixed = DocMixin(
  ParamMixin(TypeParamsMixin(TypeReturnsMixin(TsDsl<ts.FunctionTypeNode>))),
);

export class TypeFuncTsDsl extends Mixed {
  readonly '~dsl' = 'TypeFuncTsDsl';
  override scope: NodeScope = 'type';

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  override toAst(ctx: AstContext) {
    const returns = this.$returns(ctx);
    if (returns === undefined) {
      throw new Error('Missing return type in function type DSL');
    }
    const node = ts.factory.createFunctionTypeNode(
      this.$generics(ctx),
      this.$params(ctx),
      returns,
    );
    return this.$docs(ctx, node);
  }
}
