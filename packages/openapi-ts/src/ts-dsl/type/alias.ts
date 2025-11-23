import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';

const Mixed = DocMixin(
  ExportMixin(TypeParamsMixin(TsDsl<ts.TypeAliasDeclaration>)),
);

export class TypeAliasTsDsl extends Mixed {
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

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Sets the type expression on the right-hand side of `= ...`. */
  type(node: MaybeTsDsl<ts.TypeNode>): this {
    this.value = node;
    return this;
  }

  protected override _render() {
    if (!this.value)
      throw new Error(`Type alias '${this.name}' is missing a type definition`);
    return ts.factory.createTypeAliasDeclaration(
      this.modifiers,
      this.name,
      this.$generics(),
      this.$type(this.value),
    );
  }
}
