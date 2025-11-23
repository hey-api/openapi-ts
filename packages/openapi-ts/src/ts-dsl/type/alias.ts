/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DocMixin } from '../mixins/doc';
import { createModifierAccessor, ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';

export class TypeAliasTsDsl extends TsDsl<ts.TypeAliasDeclaration> {
  protected modifiers = createModifierAccessor(this);
  protected name: string;
  protected value?: MaybeTsDsl<ts.TypeNode>;

  constructor(name: Symbol | string, fn?: (t: TypeAliasTsDsl) => void) {
    super();
    if (typeof name === 'string') {
      this.name = name;
    } else {
      this.name = name.finalName;
      this.symbol = name;
      this.symbol.setKind('type');
      this.symbol.setRootNode(this);
    }
    fn?.(this);
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Sets the type expression on the right-hand side of `= ...`. */
  type(node: MaybeTsDsl<ts.TypeNode>): this {
    this.value = node;
    return this;
  }

  /** Renders a `TypeAliasDeclaration` node. */
  $render(): ts.TypeAliasDeclaration {
    if (!this.value)
      throw new Error(`Type alias '${this.name}' is missing a type definition`);
    return ts.factory.createTypeAliasDeclaration(
      this.modifiers.list(),
      this.name,
      this.$generics(),
      this.$type(this.value),
    );
  }
}

export interface TypeAliasTsDsl
  extends DocMixin,
    ExportMixin,
    TypeParamsMixin {}
mixin(TypeAliasTsDsl, DocMixin, ExportMixin, TypeParamsMixin);
