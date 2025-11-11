/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from './base';
import { mixin } from './mixins/apply';
import { DescribeMixin } from './mixins/describe';
import {
  createModifierAccessor,
  DefaultMixin,
  ExportMixin,
} from './mixins/modifiers';
import { PatternMixin } from './mixins/pattern';
import { ValueMixin } from './mixins/value';
import { TypeExprTsDsl } from './type/expr';

export class VarTsDsl extends TsDsl<ts.VariableStatement> {
  private kind: ts.NodeFlags = ts.NodeFlags.None;
  private modifiers = createModifierAccessor(this);
  private name?: string;
  private _type?: TypeTsDsl;

  constructor(name?: string) {
    super();
    this.name = name;
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
    DescribeMixin,
    ExportMixin,
    PatternMixin,
    ValueMixin {}
mixin(
  VarTsDsl,
  DefaultMixin,
  [DescribeMixin, { overrideRender: true }],
  ExportMixin,
  PatternMixin,
  ValueMixin,
);
