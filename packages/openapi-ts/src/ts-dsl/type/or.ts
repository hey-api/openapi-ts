import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { TypeTsDsl } from '../base';
import { TsDsl } from '../base';

type Type = Symbol | string | ts.TypeNode | TypeTsDsl;

const Mixed = TsDsl<ts.UnionTypeNode>;

export class TypeOrTsDsl extends Mixed {
  readonly '~dsl' = 'TypeOrTsDsl';

  protected _types: Array<Ref<Type>> = [];

  constructor(...nodes: Array<Type>) {
    super();
    this.types(...nodes);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const type of this._types) {
      ctx.analyze(type);
    }
  }

  types(...nodes: Array<Type>): this {
    this._types.push(...nodes.map((n) => ref(n)));
    return this;
  }

  override toAst(ctx: AstContext) {
    const flat: Array<ts.TypeNode> = [];

    for (const node of this._types) {
      const type = this.$type(ctx, node);
      if (ts.isUnionTypeNode(type)) {
        flat.push(...type.types);
      } else {
        flat.push(type);
      }
    }

    return ts.factory.createUnionTypeNode(flat);
  }
}
