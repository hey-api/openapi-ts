import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { OptionalMixin } from '../mixins/optional';
import { PatternMixin } from '../mixins/pattern';
import { ValueMixin } from '../mixins/value';
import { TokenTsDsl } from '../token';
import { TypeExprTsDsl } from '../type/expr';

const Mixed = DecoratorMixin(
  OptionalMixin(PatternMixin(ValueMixin(TsDsl<ts.ParameterDeclaration>))),
);

export class ParamTsDsl extends Mixed {
  protected name?: string;
  protected _type?: TypeTsDsl;

  constructor(
    name: string | ((p: ParamTsDsl) => void),
    fn?: (p: ParamTsDsl) => void,
  ) {
    super();
    if (typeof name === 'string') {
      this.name = name;
      fn?.(this);
    } else {
      name(this);
    }
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  /** Sets the parameter type. */
  type(type: string | TypeTsDsl): this {
    this._type = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  protected override _render() {
    const name = this.$pattern() ?? this.name;
    if (!name)
      throw new Error(
        'Param must have either a name or a destructuring pattern',
      );
    return ts.factory.createParameterDeclaration(
      this.$decorators(),
      undefined,
      name,
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$type(this._type),
      this.$value(),
    );
  }
}
