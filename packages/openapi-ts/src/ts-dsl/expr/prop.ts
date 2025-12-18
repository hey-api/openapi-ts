import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { GetterTsDsl } from '../decl/getter';
import { SetterTsDsl } from '../decl/setter';
import { DocMixin } from '../mixins/doc';
import { safePropName } from '../utils/name';
import { IdTsDsl } from './id';

type Expr = NodeName | MaybeTsDsl<ts.Expression>;
type Stmt = NodeName | MaybeTsDsl<ts.Statement>;
type Kind = 'computed' | 'getter' | 'prop' | 'setter' | 'spread';

type Meta =
  | { kind: 'computed'; name: string }
  | { kind: 'getter'; name: string }
  | { kind: 'prop'; name: string }
  | { kind: 'setter'; name: string }
  | { kind: 'spread'; name?: undefined };

const Mixed = DocMixin(TsDsl<ts.ObjectLiteralElementLike>);

export class ObjectPropTsDsl extends Mixed {
  readonly '~dsl' = 'ObjectPropTsDsl';

  protected _value?: Ref<Expr | Stmt>;
  protected meta: Meta;

  constructor(meta: Meta) {
    super();
    this.meta = meta;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._value);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  value(value: Expr | Stmt | ((p: ObjectPropTsDsl) => void)) {
    if (typeof value === 'function') {
      value(this);
    } else {
      this._value = ref(value);
    }
    return this;
  }

  override toAst() {
    this.$validate();
    const node = this.$node(this._value);
    if (this.meta.kind === 'spread') {
      if (ts.isStatement(node)) {
        throw new Error(
          'Invalid spread: object spread must be an expression, not a statement.',
        );
      }
      const result = ts.factory.createSpreadAssignment(node);
      return this.$docs(result);
    }
    if (this.meta.kind === 'getter') {
      const getter = new GetterTsDsl(this.meta.name).do(node);
      const result = this.$node(getter);
      return this.$docs(result);
    }
    if (this.meta.kind === 'setter') {
      const setter = new SetterTsDsl(this.meta.name).do(node);
      const result = this.$node(setter);
      return this.$docs(result);
    }
    if (ts.isIdentifier(node) && node.text === this.meta.name) {
      const result = ts.factory.createShorthandPropertyAssignment(
        this.meta.name,
      );
      return this.$docs(result);
    }
    if (ts.isStatement(node)) {
      throw new Error(
        'Invalid property: object property value must be an expression, not a statement.',
      );
    }
    const result = ts.factory.createPropertyAssignment(
      this.meta.kind === 'computed'
        ? ts.factory.createComputedPropertyName(
            this.$node(new IdTsDsl(this.meta.name)),
          )
        : this.$node(safePropName(this.meta.name)),
      node,
    );
    return this.$docs(result);
  }

  $validate(): asserts this is this & {
    _value: Expr | Stmt;
    kind: Kind;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(
      `Object property${this.meta.name ? ` "${this.meta.name}"` : ''} missing ${missing.join(' and ')}`,
    );
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._value) missing.push('.value()');
    return missing;
  }
}
