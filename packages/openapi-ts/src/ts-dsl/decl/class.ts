import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { NewlineTsDsl } from '../layout/newline';
import { DecoratorMixin } from '../mixins/decorator';
import { DocMixin } from '../mixins/doc';
import { AbstractMixin, DefaultMixin, ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';
import { FieldTsDsl } from './field';
import { InitTsDsl } from './init';
import { MethodTsDsl } from './method';

type Base = Symbol | string;
type Name = Symbol | string;
type Body = Array<MaybeTsDsl<ts.ClassElement | ts.Node>>;

const Mixed = AbstractMixin(
  DecoratorMixin(
    DefaultMixin(
      DocMixin(ExportMixin(TypeParamsMixin(TsDsl<ts.ClassDeclaration>))),
    ),
  ),
);

export class ClassTsDsl extends Mixed {
  protected baseClass?: Base;
  protected body: Body = [];
  protected name: Name;

  constructor(name: Name) {
    super();
    this.name = name;
    if (isSymbol(name)) {
      name.setKind('class');
      name.setNode(this);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.baseClass)) ctx.addDependency(this.baseClass);
    if (isSymbol(this.name)) ctx.addDependency(this.name);
    for (const item of this.body) {
      if (isTsDsl(item)) item.analyze(ctx);
    }
  }

  /** Adds one or more class members (fields, methods, etc.). */
  do(...items: Body): this {
    this.body.push(...items);
    return this;
  }

  /** Records a base class to extend from. */
  extends(base?: Base): this {
    this.baseClass = base;
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

  protected override _render() {
    const body = this.$node(this.body) as ReadonlyArray<ts.ClassElement>;
    return ts.factory.createClassDeclaration(
      [...this.$decorators(), ...this.modifiers],
      // @ts-expect-error need to improve types
      this.$node(this.name),
      this.$generics(),
      this._renderHeritage(),
      body,
    );
  }

  /** Builds heritage clauses (extends). */
  private _renderHeritage(): ReadonlyArray<ts.HeritageClause> {
    if (!this.baseClass) return [];
    return [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(
          this.$node(this.baseClass),
          undefined,
        ),
      ]),
    ];
  }
}
