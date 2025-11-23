/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DocMixin } from '../mixins/doc';
import { createModifierAccessor, ReadonlyMixin } from '../mixins/modifiers';
import { OptionalMixin } from '../mixins/optional';
import { TokenTsDsl } from '../token';
import { safePropName } from '../utils/prop';

export class TypePropTsDsl extends TypeTsDsl<ts.TypeElement> {
  protected modifiers = createModifierAccessor(this);
  protected name: string;
  protected _type?: string | MaybeTsDsl<ts.TypeNode>;

  constructor(name: string, fn: (p: TypePropTsDsl) => void) {
    super();
    this.name = name;
    fn(this);
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Sets the property type. */
  type(type: string | MaybeTsDsl<ts.TypeNode>): this {
    this._type = type;
    return this;
  }

  /** Builds and returns the property signature. */
  $render(): ts.TypeElement {
    if (!this._type) {
      throw new Error(`Type not specified for property '${this.name}'`);
    }
    return ts.factory.createPropertySignature(
      this.modifiers.list(),
      safePropName(this.name),
      this._optional ? this.$node(new TokenTsDsl().optional()) : undefined,
      this.$type(this._type),
    );
  }
}

export interface TypePropTsDsl extends DocMixin, OptionalMixin, ReadonlyMixin {}
mixin(TypePropTsDsl, DocMixin, OptionalMixin, ReadonlyMixin);
