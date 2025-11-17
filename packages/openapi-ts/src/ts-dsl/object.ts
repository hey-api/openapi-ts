/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { numberRegExp } from '~/utils/regexp';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { GetterTsDsl } from './getter';
import { mixin } from './mixins/apply';
import { AsMixin } from './mixins/as';
import { ExprMixin } from './mixins/expr';
import { HintMixin } from './mixins/hint';
import { LayoutMixin } from './mixins/layout';
import { SetterTsDsl } from './setter';

export class ObjectTsDsl extends TsDsl<ts.ObjectLiteralExpression> {
  private props: Array<
    | {
        expr: string | MaybeTsDsl<ts.Expression>;
        kind: 'computed';
        name: string;
      }
    | {
        expr: string | MaybeTsDsl<ts.Statement>;
        kind: 'getter';
        name: string;
      }
    | { expr: string | MaybeTsDsl<ts.Expression>; kind: 'prop'; name: string }
    | {
        expr: string | MaybeTsDsl<ts.Statement>;
        kind: 'setter';
        name: string;
      }
    | { expr: string | MaybeTsDsl<ts.Expression>; kind: 'spread' }
  > = [];

  /** Adds a computed property (e.g. `{ [expr]: value }`). */
  computed(name: string, expr: string | MaybeTsDsl<ts.Expression>): this {
    this.props.push({ expr, kind: 'computed', name });
    return this;
  }

  /** Adds a getter property (e.g. `{ get foo() { ... } }`). */
  getter(name: string, expr: string | MaybeTsDsl<ts.Statement>): this {
    this.props.push({ expr, kind: 'getter', name });
    return this;
  }

  /** Returns true if object has at least one property or spread. */
  hasProps(): boolean {
    return this.props.length > 0;
  }

  /** Returns true if object has no properties or spreads. */
  get isEmpty(): boolean {
    return !this.props.length;
  }

  /** Adds a property assignment. */
  prop(name: string, expr: string | MaybeTsDsl<ts.Expression>): this {
    this.props.push({ expr, kind: 'prop', name });
    return this;
  }

  /** Adds a setter property (e.g. `{ set foo(v) { ... } }`). */
  setter(name: string, expr: string | MaybeTsDsl<ts.Statement>): this {
    this.props.push({ expr, kind: 'setter', name });
    return this;
  }

  /** Adds a spread property (e.g. `{ ...options }`). */
  spread(expr: string | MaybeTsDsl<ts.Expression>): this {
    this.props.push({ expr, kind: 'spread' });
    return this;
  }

  /** Builds and returns the object literal expression. */
  $render(): ts.ObjectLiteralExpression {
    const props = this.props.map((p) => {
      const node = this.$node(p.expr);
      if (p.kind === 'spread') {
        if (ts.isStatement(node)) {
          throw new Error(
            'Invalid spread: object spread must be an expression, not a statement.',
          );
        }
        return ts.factory.createSpreadAssignment(node);
      }
      if (p.kind === 'getter') {
        const getter = new GetterTsDsl(
          this.safePropertyName(p.name) as string,
        ).do(node);
        return this.$node(getter);
      }
      if (p.kind === 'setter') {
        const setter = new SetterTsDsl(
          this.safePropertyName(p.name) as string,
        ).do(node);
        return this.$node(setter);
      }
      if (ts.isIdentifier(node) && node.text === p.name) {
        return ts.factory.createShorthandPropertyAssignment(p.name);
      }
      if (ts.isStatement(node)) {
        throw new Error(
          'Invalid property: object property value must be an expression, not a statement.',
        );
      }
      const name = this.safePropertyName(p.name);
      return ts.factory.createPropertyAssignment(
        p.kind === 'computed'
          ? ts.factory.createComputedPropertyName(this.$node(name as string))
          : name,
        node,
      );
    });

    return ts.factory.createObjectLiteralExpression(
      props,
      this.$multiline(this.props.length),
    );
  }

  private safePropertyName(name: string): string | ts.PropertyName {
    let propertyName: string | ts.PropertyName;
    numberRegExp.lastIndex = 0;
    if (numberRegExp.test(name)) {
      // For numeric literals, we'll handle negative numbers by using a string literal
      // instead of trying to use a PrefixUnaryExpression
      propertyName = name.startsWith('-')
        ? ts.factory.createStringLiteral(name)
        : ts.factory.createNumericLiteral(name);
    } else {
      propertyName = name;
    }
    if (
      ((name.match(/^[0-9]/) && name.match(/\D+/g)) || name.match(/\W/g)) &&
      !name.startsWith("'") &&
      !name.endsWith("'")
    ) {
      propertyName = `'${name}'`;
    }
    return propertyName;
  }
}

export interface ObjectTsDsl
  extends AsMixin,
    ExprMixin,
    HintMixin,
    LayoutMixin {}
mixin(ObjectTsDsl, AsMixin, ExprMixin, HintMixin, LayoutMixin);
