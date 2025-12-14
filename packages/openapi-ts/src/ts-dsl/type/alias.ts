import type {
  AnalysisContext,
  AstContext,
  Ref,
  Symbol,
} from '@hey-api/codegen-core';
import { fromRef, isSymbol, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';
import { safeTypeName } from '../utils/name';

type Name = Symbol | string;
type Value = MaybeTsDsl<ts.TypeNode>;

const Mixed = DocMixin(
  ExportMixin(TypeParamsMixin(TsDsl<ts.TypeAliasDeclaration>)),
);

export class TypeAliasTsDsl extends Mixed {
  readonly '~dsl' = 'TypeAliasTsDsl';

  protected name: Ref<Name>;
  protected value?: Value;

  constructor(name: Name, fn?: (t: TypeAliasTsDsl) => void) {
    super();
    this.name = ref(name);
    if (isSymbol(name)) {
      name.setKind('type');
      name.setNameSanitizer(safeTypeName);
      name.setNode(this);
    }
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
    ctx.analyze(this.value);
  }

  /** Sets the type expression on the right-hand side of `= ...`. */
  type(node: Value): this {
    this.value = node;
    return this;
  }

  override toAst(ctx: AstContext) {
    if (!this.value)
      throw new Error(
        `Type alias '${fromRef(this.name)}' is missing a type definition`,
      );
    const node = ts.factory.createTypeAliasDeclaration(
      this.modifiers,
      this.$node(ctx, this.name) as ts.Identifier,
      this.$generics(ctx),
      this.$type(ctx, this.value),
    );
    return this.$docs(ctx, node);
  }
}
