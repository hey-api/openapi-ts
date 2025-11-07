/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DescribeMixin } from './mixins/describe';
import {
  createModifierAccessor,
  DefaultMixin,
  ExportMixin,
} from './mixins/modifiers';
import { ValueMixin } from './mixins/value';

export class VarTsDsl extends TsDsl<ts.VariableStatement> {
  private kind: ts.NodeFlags = ts.NodeFlags.None;
  private modifiers = createModifierAccessor(this);
  private name?: string;
  private pattern?: ReadonlyArray<string> | Record<string, string>;
  private _rest?: string;

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

  object(
    ...props: ReadonlyArray<
      string | ReadonlyArray<string> | Record<string, string>
    >
  ): this {
    const entries: Record<string, string> = {};
    for (const p of props) {
      if (typeof p === 'string') {
        entries[p] = p; // shorthand
      } else if (p instanceof Array) {
        for (const name of p) entries[name] = name;
      } else {
        Object.assign(entries, p);
      }
    }
    this.pattern = entries;
    return this;
  }

  rest(name: string): this {
    this._rest = name;
    return this;
  }

  tuple(...props: ReadonlyArray<string> | [ReadonlyArray<string>]): this {
    const names =
      props[0] instanceof Array
        ? [...props[0]]
        : (props as ReadonlyArray<string>);
    this.pattern = names;
    return this;
  }

  var(): this {
    this.kind = ts.NodeFlags.None;
    return this;
  }

  $render(): ts.VariableStatement {
    let _pattern: ts.BindingPattern | undefined;

    if (this.pattern) {
      if (this.pattern instanceof Array) {
        const elements = this.pattern.map((p) =>
          ts.factory.createBindingElement(
            undefined,
            undefined,
            ts.factory.createIdentifier(p),
          ),
        );

        const restEl = this.createRest();
        if (restEl) elements.push(restEl);

        _pattern = ts.factory.createArrayBindingPattern(elements);
      } else {
        const elements = Object.entries(this.pattern).map(([key, alias]) =>
          key === alias
            ? ts.factory.createBindingElement(
                undefined,
                undefined,
                ts.factory.createIdentifier(key),
              )
            : ts.factory.createBindingElement(
                undefined,
                ts.factory.createIdentifier(key),
                ts.factory.createIdentifier(alias),
              ),
        );

        const restEl = this.createRest();
        if (restEl) elements.push(restEl);

        _pattern = ts.factory.createObjectBindingPattern(elements);
      }
    }
    const name = _pattern ?? this.name;
    if (!name) {
      throw new Error('Var must have either a name or a destructuring pattern');
    }
    return ts.factory.createVariableStatement(
      this.modifiers.list(),
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            name,
            undefined,
            undefined,
            this.$node(this.initializer),
          ),
        ],
        this.kind,
      ),
    );
  }

  private createRest(): ts.BindingElement | undefined {
    return this._rest
      ? ts.factory.createBindingElement(
          ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
          undefined,
          ts.factory.createIdentifier(this._rest),
        )
      : undefined;
  }
}

export interface VarTsDsl
  extends DefaultMixin,
    DescribeMixin,
    ExportMixin,
    ValueMixin {}
mixin(
  VarTsDsl,
  DefaultMixin,
  [DescribeMixin, { overrideRender: true }],
  ExportMixin,
  ValueMixin,
);
