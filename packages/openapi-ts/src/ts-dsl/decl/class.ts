/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { NewlineTsDsl } from '../layout/newline';
import { mixin } from '../mixins/apply';
import { DecoratorMixin } from '../mixins/decorator';
import { DocMixin } from '../mixins/doc';
import {
  AbstractMixin,
  createModifierAccessor,
  DefaultMixin,
  ExportMixin,
} from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';
import { FieldTsDsl } from './field';
import { InitTsDsl } from './init';
import { MethodTsDsl } from './method';

export class ClassTsDsl extends TsDsl<ts.ClassDeclaration> {
  protected baseClass?: Symbol | string;
  protected body: Array<MaybeTsDsl<ts.ClassElement | NewlineTsDsl>> = [];
  protected modifiers = createModifierAccessor(this);
  protected name: string;

  constructor(name: Symbol | string) {
    super();
    if (typeof name === 'string') {
      this.name = name;
      return;
    }
    this.name = name.finalName;
    this.symbol = name;
    this.symbol.setKind('class');
    this.symbol.setRootNode(this);
  }

  /** Adds one or more class members (fields, methods, etc.). */
  do(...items: ReadonlyArray<MaybeTsDsl<ts.ClassElement | ts.Node>>): this {
    for (const item of items) {
      if (item && typeof item === 'object' && 'setParent' in item) {
        item.setParent(this);
      }
      // @ts-expect-error --- IGNORE ---
      this.body.push(item);
    }
    return this;
  }

  /** Records a base class to extend from without rendering early. */
  extends(base?: Symbol | string): this {
    if (!base) return this;
    this.baseClass = base;
    if (typeof base !== 'string') {
      const symbol = this.getRootSymbol();
      if (symbol) symbol.addDependency(base);
    }
    return this;
  }

  /** Adds a class field. */
  field(name: string, fn?: (f: FieldTsDsl) => void): this {
    const f = new FieldTsDsl(name, fn).setParent(this);
    this.body.push(f);
    return this;
  }

  /** Adds a class constructor. */
  init(fn?: (i: InitTsDsl) => void): this {
    const i = new InitTsDsl(fn).setParent(this);
    this.body.push(i);
    return this;
  }

  /** Adds a class method. */
  method(name: string, fn?: (m: MethodTsDsl) => void): this {
    const m = new MethodTsDsl(name, fn).setParent(this);
    this.body.push(m);
    return this;
  }

  /** Inserts an empty line between members for formatting. */
  newline(): this {
    this.body.push(new NewlineTsDsl());
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Builds the `ClassDeclaration` node. */
  $render(): ts.ClassDeclaration {
    const body = this.$node(this.body) as ReadonlyArray<ts.ClassElement>;
    return ts.factory.createClassDeclaration(
      [...this.$decorators(), ...this.modifiers.list()],
      this.name,
      this.$generics(),
      this._renderHeritage(),
      body,
    );
  }

  /** Builds heritage clauses (extends). */
  private _renderHeritage(): ReadonlyArray<ts.HeritageClause> {
    if (!this.baseClass) return [];
    const id =
      typeof this.baseClass === 'string'
        ? this.$maybeId(this.baseClass)
        : this.$maybeId(this.baseClass.finalName);
    return [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(id, undefined),
      ]),
    ];
  }
}

export interface ClassTsDsl
  extends AbstractMixin,
    DecoratorMixin,
    DefaultMixin,
    DocMixin,
    ExportMixin,
    TypeParamsMixin {}
mixin(
  ClassTsDsl,
  AbstractMixin,
  DecoratorMixin,
  DefaultMixin,
  DocMixin,
  ExportMixin,
  TypeParamsMixin,
);
