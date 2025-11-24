import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { HintMixin } from '../mixins/hint';
import { DefaultMixin, ExportMixin } from '../mixins/modifiers';
import { PatternMixin } from '../mixins/pattern';
import { ValueMixin } from '../mixins/value';
import { TypeExprTsDsl } from '../type/expr';

const Mixed = DefaultMixin(
  DocMixin(
    ExportMixin(
      HintMixin(PatternMixin(ValueMixin(TsDsl<ts.VariableStatement>))),
    ),
  ),
);

export class VarTsDsl extends Mixed {
  protected kind: ts.NodeFlags = ts.NodeFlags.None;
  protected name?: string;
  protected _type?: TypeTsDsl;

  constructor(name?: Symbol | string) {
    super();
    if (name) {
      if (typeof name === 'string') {
        this.name = name;
      } else {
        this.name = name.finalName;
        this.symbol = name;
        this.symbol.setKind('var');
        this.symbol.setRootNode(this);
      }
    }
  }

  const(): this {
    this.kind = ts.NodeFlags.Const;
    return this;
  }

  let(): this {
    this.kind = ts.NodeFlags.Let;
    return this;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
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

  protected override _render() {
    const name = this.$pattern() ?? this.name;
    if (!name)
      throw new Error('Var must have either a name or a destructuring pattern');
    return ts.factory.createVariableStatement(
      this.modifiers,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            name,
            undefined,
            this.$type(this._type),
            this.$value(),
          ),
        ],
        this.kind,
      ),
    );
  }
}
