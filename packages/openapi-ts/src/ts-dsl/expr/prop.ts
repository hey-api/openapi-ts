import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { GetterTsDsl } from '../decl/getter';
import { SetterTsDsl } from '../decl/setter';
import { DocMixin } from '../mixins/doc';
import { safePropName } from '../utils/prop';
import { IdTsDsl } from './id';

type Expr = string | MaybeTsDsl<ts.Expression>;
type Stmt = string | MaybeTsDsl<ts.Statement>;
type Kind = 'computed' | 'getter' | 'prop' | 'setter' | 'spread';

type Meta =
  | { kind: 'computed'; name: string }
  | { kind: 'getter'; name: string }
  | { kind: 'prop'; name: string }
  | { kind: 'setter'; name: string }
  | { kind: 'spread'; name?: undefined };

const Mixed = DocMixin(TsDsl<ts.ObjectLiteralElementLike>);

export class ObjectPropTsDsl extends Mixed {
  protected _value?: Expr | Stmt;
  protected meta: Meta;

  constructor(meta: Meta) {
    super();
    this.meta = meta;
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  value(value: Expr | Stmt | ((p: ObjectPropTsDsl) => void)) {
    if (typeof value === 'function') {
      value(this);
    } else {
      this._value = value;
    }
    return this;
  }

  protected override _render() {
    this.$validate();
    const node = this.$node(this._value);
    if (this.meta.kind === 'spread') {
      if (ts.isStatement(node)) {
        throw new Error(
          'Invalid spread: object spread must be an expression, not a statement.',
        );
      }
      return ts.factory.createSpreadAssignment(node);
    }
    if (this.meta.kind === 'getter') {
      const getter = new GetterTsDsl(safePropName(this.meta.name)).do(node);
      return this.$node(getter);
    }
    if (this.meta.kind === 'setter') {
      const setter = new SetterTsDsl(safePropName(this.meta.name)).do(node);
      return this.$node(setter);
    }
    if (ts.isIdentifier(node) && node.text === this.meta.name) {
      return ts.factory.createShorthandPropertyAssignment(this.meta.name);
    }
    if (ts.isStatement(node)) {
      throw new Error(
        'Invalid property: object property value must be an expression, not a statement.',
      );
    }
    return ts.factory.createPropertyAssignment(
      this.meta.kind === 'computed'
        ? ts.factory.createComputedPropertyName(
            this.$node(new IdTsDsl(this.meta.name)),
          )
        : safePropName(this.meta.name),
      node,
    );
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
