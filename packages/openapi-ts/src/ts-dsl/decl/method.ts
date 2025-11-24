import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl, TypeTsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DoMixin } from '../mixins/do';
import { DocMixin } from '../mixins/doc';
import {
  AbstractMixin,
  AsyncMixin,
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { OptionalMixin } from '../mixins/optional';
import { ParamMixin } from '../mixins/param';
import { TypeParamsMixin } from '../mixins/type-params';
import { TokenTsDsl } from '../token';
import { TypeExprTsDsl } from '../type/expr';

const Mixed = AbstractMixin(
  AsyncMixin(
    DecoratorMixin(
      DoMixin(
        DocMixin(
          OptionalMixin(
            ParamMixin(
              PrivateMixin(
                ProtectedMixin(
                  PublicMixin(
                    StaticMixin(TypeParamsMixin(TsDsl<ts.MethodDeclaration>)),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);

export class MethodTsDsl extends Mixed {
  protected name: string;
  protected _returns?: TypeTsDsl;

  constructor(name: string, fn?: (m: MethodTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  /** Sets the return type. */
  returns(type: string | TypeTsDsl): this {
    this._returns = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createMethodDeclaration(
      [...this.$decorators(), ...this.modifiers],
      undefined,
      this.name,
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$generics(),
      this.$params(),
      this.$type(this._returns),
      ts.factory.createBlock(this.$do(), true),
    );
  }
}
