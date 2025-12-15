import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { NewlineTsDsl } from '../layout/newline';
import { DecoratorMixin } from '../mixins/decorator';
import { DocMixin } from '../mixins/doc';
import { AbstractMixin, DefaultMixin, ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';
import { safeRuntimeName } from '../utils/name';
import type { FieldName } from './field';
import { FieldTsDsl } from './field';
import { InitTsDsl } from './init';
import type { MethodName } from './method';
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
  readonly '~dsl' = 'ClassTsDsl';

  protected baseClass?: Ref<Base>;
  protected body: Body = [];
  protected name: Ref<Name>;

  constructor(name: Name) {
    super();
    this.name = ref(name);
    if (isSymbol(name)) {
      name.setKind('class');
      name.setNameSanitizer(safeRuntimeName);
      name.setNode(this);
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.baseClass);
    ctx.analyze(this.name);
    ctx.pushScope();
    try {
      for (const item of this.body) {
        ctx.analyze(item);
      }
    } finally {
      ctx.popScope();
    }
  }

  /** Returns true if the class has any members. */
  get hasBody(): boolean {
    return this.body.length > 0;
  }

  /** Adds one or more class members (fields, methods, etc.). */
  do(...items: Body): this {
    this.body.push(...items);
    return this;
  }

  /** Records a base class to extend from. */
  extends(base?: Base): this {
    this.baseClass = base ? ref(base) : undefined;
    return this;
  }

  /** Adds a class field. */
  field(name: FieldName, fn?: (f: FieldTsDsl) => void): this {
    const f = new FieldTsDsl(name, fn);
    this.body.push(f);
    return this;
  }

  /** Adds a class constructor. */
  init(fn?: InitTsDsl | ((i: InitTsDsl) => void)): this {
    const i =
      typeof fn === 'function' ? new InitTsDsl(fn) : fn || new InitTsDsl();
    this.body.push(i);
    return this;
  }

  /** Adds a class method. */
  method(name: MethodName, fn?: (m: MethodTsDsl) => void): this {
    const m = new MethodTsDsl(name, fn);
    this.body.push(m);
    return this;
  }

  /** Inserts an empty line between members for formatting. */
  newline(): this {
    this.body.push(new NewlineTsDsl());
    return this;
  }

  override toAst(ctx: AstContext) {
    const body = this.$node(ctx, this.body) as ReadonlyArray<ts.ClassElement>;
    const node = ts.factory.createClassDeclaration(
      [...this.$decorators(ctx), ...this.modifiers],
      this.$node(ctx, this.name) as ts.Identifier,
      this.$generics(ctx),
      this._heritage(ctx),
      body,
    );
    return this.$docs(ctx, node);
  }

  /** Builds heritage clauses (extends). */
  private _heritage(ctx: AstContext): ReadonlyArray<ts.HeritageClause> {
    const node = this.$node(ctx, this.baseClass);
    if (!node) return [];
    return [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(node, undefined),
      ]),
    ];
  }
}
