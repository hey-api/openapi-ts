import type { AnalysisContext, Symbol } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { isTsDsl, TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';

type Name = Symbol | string;
type Value = MaybeTsDsl<ts.TypeNode>;

const Mixed = DocMixin(
  ExportMixin(TypeParamsMixin(TsDsl<ts.TypeAliasDeclaration>)),
);

export class TypeAliasTsDsl extends Mixed {
  protected name: Name;
  protected value?: Value;

  constructor(name: Name, fn?: (t: TypeAliasTsDsl) => void) {
    super();
    this.name = name;
    if (isSymbol(name)) {
      name.setKind('type');
      name.setNode(this);
    }
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this.name)) ctx.addDependency(this.name);
    if (isTsDsl(this.value)) this.value.analyze(ctx);
  }

  /** Sets the type expression on the right-hand side of `= ...`. */
  type(node: Value): this {
    this.value = node;
    return this;
  }

  protected override _render() {
    if (!this.value)
      throw new Error(`Type alias '${this.name}' is missing a type definition`);
    return ts.factory.createTypeAliasDeclaration(
      this.modifiers,
      // @ts-expect-error need to improve types
      this.$node(this.name),
      this.$generics(),
      this.$type(this.value),
    );
  }
}
