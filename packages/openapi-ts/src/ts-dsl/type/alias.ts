/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { createModifierAccessor, ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';

export class TypeAliasTsDsl extends TsDsl<ts.TypeAliasDeclaration> {
  private value?: MaybeTsDsl<ts.TypeNode>;
  private modifiers = createModifierAccessor(this);
  private name: string;

  constructor(name: string, fn?: (t: TypeAliasTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
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

export interface TypeAliasTsDsl extends ExportMixin, TypeParamsMixin {}
mixin(TypeAliasTsDsl, ExportMixin, TypeParamsMixin);
