import type { AnalysisContext, Ref, Symbol } from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { HintMixin } from '../mixins/hint';
import { DefaultMixin, ExportMixin } from '../mixins/modifiers';
import { PatternMixin } from '../mixins/pattern';
import { ValueMixin } from '../mixins/value';
import { TypeExprTsDsl } from '../type/expr';
import { safeRuntimeName } from '../utils/name';

export type VarName = Symbol | string;

const Mixed = DefaultMixin(
  DocMixin(
    ExportMixin(
      HintMixin(PatternMixin(ValueMixin(TsDsl<ts.VariableStatement>))),
    ),
  ),
);

export class VarTsDsl extends Mixed {
  readonly '~dsl' = 'VarTsDsl';

  protected kind: ts.NodeFlags = ts.NodeFlags.None;
  protected name?: Ref<VarName>;
  protected _type?: TypeTsDsl;

  constructor(name?: VarName) {
    super();
    if (name) this.name = ref(name);
    if (isSymbol(name)) {
      name.setKind('var');
      name.setNameSanitizer(safeRuntimeName);
      name.setNode(this);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
    ctx.analyze(this._type);
  }

  const(): this {
    this.kind = ts.NodeFlags.Const;
    return this;
  }

  let(): this {
    this.kind = ts.NodeFlags.Let;
    return this;
  }

  /** Sets the variable type. */
  type(type: string | TypeTsDsl): this {
    this._type = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  var(): this {
    this.kind = ts.NodeFlags.None;
    return this;
  }

  override toAst() {
    const name = this.$pattern() ?? this.$node(this.name);
    if (!name)
      throw new Error('Var must have either a name or a destructuring pattern');
    const node = ts.factory.createVariableStatement(
      this.modifiers,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            // @ts-expect-error need to improve types
            name,
            undefined,
            this.$type(this._type),
            this.$value(),
          ),
        ],
        this.kind,
      ),
    );
    return this.$docs(this.$hint(node));
  }
}
