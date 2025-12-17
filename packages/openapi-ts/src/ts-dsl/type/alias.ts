import type {
  AnalysisContext,
  AstContext,
  NodeName,
  NodeScope,
} from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';
import { safeTypeName } from '../utils/name';

type Value = MaybeTsDsl<ts.TypeNode>;

const Mixed = DocMixin(
  ExportMixin(TypeParamsMixin(TsDsl<ts.TypeAliasDeclaration>)),
);

export class TypeAliasTsDsl extends Mixed {
  readonly '~dsl' = 'TypeAliasTsDsl';
  override readonly nameSanitizer = safeTypeName;
  override scope: NodeScope = 'type';

  protected value?: Value;

  constructor(name: NodeName, fn?: (t: TypeAliasTsDsl) => void) {
    super();
    this.name.set(name);
    if (isSymbol(name)) {
      name.setKind('type');
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
        `Type alias '${this.name.toString()}' is missing a type definition`,
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
