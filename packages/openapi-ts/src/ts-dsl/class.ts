/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { FieldTsDsl } from './field';
import { InitTsDsl } from './init';
import { MethodTsDsl } from './method';
import { mixin } from './mixins/apply';
import { DecoratorMixin } from './mixins/decorator';
import { DescribeMixin } from './mixins/describe';
import { GenericsMixin } from './mixins/generics';
import {
  AbstractMixin,
  createModifierAccessor,
  DefaultMixin,
  ExportMixin,
} from './mixins/modifiers';
import { NewlineTsDsl } from './newline';

export class ClassTsDsl extends TsDsl<ts.ClassDeclaration> {
  private heritageClauses: Array<ts.HeritageClause> = [];
  private body: Array<MaybeTsDsl<ts.ClassElement> | NewlineTsDsl> = [];
  private modifiers = createModifierAccessor(this);
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** Adds one or more class members (fields, methods, etc.). */
  do(...items: ReadonlyArray<MaybeTsDsl<ts.ClassElement | ts.Node>>): this {
    // @ts-expect-error --- IGNORE ---
    this.body.push(...items);
    return this;
  }

  /** Adds a base class to extend from. */
  extends(base?: WithString | false | null): this {
    if (!base) return this;
    this.heritageClauses.push(
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(
          this.$expr(base),
          undefined,
        ),
      ]),
    );
    return this;
  }

  /** Adds a class field. */
  field(name: string, fn?: (f: FieldTsDsl) => void): this {
    const f = new FieldTsDsl(name, fn);
    this.body.push(f);
    return this;
  }

  /** Adds a class constructor. */
  init(fn?: (i: InitTsDsl) => void): this {
    const i = new InitTsDsl(fn);
    this.body.push(i);
    return this;
  }

  /** Adds a class method. */
  method(name: string, fn?: (m: MethodTsDsl) => void): this {
    const m = new MethodTsDsl(name, fn);
    this.body.push(m);
    return this;
  }

  /** Inserts an empty line between members for formatting. */
  newline(): this {
    this.body.push(new NewlineTsDsl());
    return this;
  }

  /** Builds the `ClassDeclaration` node. */
  $render(): ts.ClassDeclaration {
    const body = this.$node(this.body) as ReadonlyArray<ts.ClassElement>;
    return ts.factory.createClassDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      ts.factory.createIdentifier(this.name),
      this.$generics(),
      this.heritageClauses,
      body,
    );
  }
}

export interface ClassTsDsl
  extends AbstractMixin,
    DecoratorMixin,
    DescribeMixin,
    DefaultMixin,
    ExportMixin,
    GenericsMixin {}
mixin(
  ClassTsDsl,
  AbstractMixin,
  DecoratorMixin,
  [DescribeMixin, { overrideRender: true }],
  DefaultMixin,
  ExportMixin,
  GenericsMixin,
);
