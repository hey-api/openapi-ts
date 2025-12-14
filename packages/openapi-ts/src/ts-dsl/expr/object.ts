import type {
  AnalysisContext,
  AstContext,
  Symbol,
} from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { AsMixin } from '../mixins/as';
import { ExprMixin } from '../mixins/expr';
import { HintMixin } from '../mixins/hint';
import { LayoutMixin } from '../mixins/layout';
import { ObjectPropTsDsl } from './prop';

type Expr = Symbol | string | MaybeTsDsl<ts.Expression>;
type Stmt = Symbol | string | MaybeTsDsl<ts.Statement>;
type ExprFn = Expr | ((p: ObjectPropTsDsl) => void);
type StmtFn = Stmt | ((p: ObjectPropTsDsl) => void);

const Mixed = AsMixin(
  ExprMixin(HintMixin(LayoutMixin(TsDsl<ts.ObjectLiteralExpression>))),
);

export class ObjectTsDsl extends Mixed {
  readonly '~dsl' = 'ObjectTsDsl';

  protected _props: Array<ObjectPropTsDsl> = [];

  constructor(...props: Array<ObjectPropTsDsl>) {
    super();
    this.props(...props);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const prop of this._props) {
      ctx.analyze(prop);
    }
  }

  /** Adds a computed property (e.g. `{ [expr]: value }`). */
  computed(name: string, expr: ExprFn): this {
    this._props.push(
      new ObjectPropTsDsl({ kind: 'computed', name }).value(expr),
    );
    return this;
  }

  /** Adds a getter property (e.g. `{ get foo() { ... } }`). */
  getter(name: string, stmt: StmtFn): this {
    this._props.push(new ObjectPropTsDsl({ kind: 'getter', name }).value(stmt));
    return this;
  }

  /** Returns true if object has at least one property or spread. */
  hasProps(): boolean {
    return this._props.length > 0;
  }

  /** Returns true if object has no properties or spreads. */
  get isEmpty(): boolean {
    return this._props.length === 0;
  }

  /** Adds a property assignment. */
  prop(name: string, expr: ExprFn): this {
    this._props.push(new ObjectPropTsDsl({ kind: 'prop', name }).value(expr));
    return this;
  }

  /** Adds multiple properties. */
  props(...props: ReadonlyArray<ObjectPropTsDsl>): this {
    this._props.push(...props);
    return this;
  }

  /** Adds a setter property (e.g. `{ set foo(v) { ... } }`). */
  setter(name: string, stmt: StmtFn): this {
    this._props.push(new ObjectPropTsDsl({ kind: 'setter', name }).value(stmt));
    return this;
  }

  /** Adds a spread property (e.g. `{ ...options }`). */
  spread(expr: ExprFn): this {
    this._props.push(new ObjectPropTsDsl({ kind: 'spread' }).value(expr));
    return this;
  }

  override toAst(ctx: AstContext) {
    const node = ts.factory.createObjectLiteralExpression(
      this.$node(ctx, this._props),
      this.$multiline(this._props.length),
    );
    return this.$hint(ctx, node);
  }
}
