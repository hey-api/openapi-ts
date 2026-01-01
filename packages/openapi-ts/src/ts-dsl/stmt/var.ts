import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { HintMixin } from '../mixins/hint';
import { DefaultMixin, ExportMixin } from '../mixins/modifiers';
import { PatternMixin } from '../mixins/pattern';
import { ValueMixin } from '../mixins/value';
import { TypeExprTsDsl } from '../type/expr';
import { safeRuntimeName } from '../utils/name';

const Mixed = DefaultMixin(
  DocMixin(
    ExportMixin(
      HintMixin(PatternMixin(ValueMixin(TsDsl<ts.VariableStatement>))),
    ),
  ),
);

export class VarTsDsl extends Mixed {
  readonly '~dsl' = 'VarTsDsl';
  override readonly nameSanitizer = safeRuntimeName;

  protected kind: ts.NodeFlags = ts.NodeFlags.None;
  protected _type?: TypeTsDsl;

  constructor(name?: NodeName) {
    super();
    if (name) this.name.set(name);
    if (isSymbol(name)) {
      name.setKind('var');
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
            name as ts.BindingName,
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
