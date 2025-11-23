/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DocMixin } from '../mixins/doc';
import { HintMixin } from '../mixins/hint';
import {
  createModifierAccessor,
  DefaultMixin,
  ExportMixin,
} from '../mixins/modifiers';
import { PatternMixin } from '../mixins/pattern';
import { ValueMixin } from '../mixins/value';
import { TypeExprTsDsl } from '../type/expr';

export class VarTsDsl extends TsDsl<ts.VariableStatement> {
  protected kind: ts.NodeFlags = ts.NodeFlags.None;
  protected modifiers = createModifierAccessor(this);
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

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
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

  $render(): ts.VariableStatement {
    const name = this.$pattern() ?? this.name;
    if (!name)
      throw new Error('Var must have either a name or a destructuring pattern');
    return ts.factory.createVariableStatement(
      this.modifiers.list(),
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

export interface VarTsDsl
  extends DefaultMixin,
    DocMixin,
    ExportMixin,
    HintMixin,
    PatternMixin,
    ValueMixin {}
mixin(
  VarTsDsl,
  DefaultMixin,
  DocMixin,
  ExportMixin,
  HintMixin,
  PatternMixin,
  ValueMixin,
);
