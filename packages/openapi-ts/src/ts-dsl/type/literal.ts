import type { AnalysisContext, NodeScope } from '@hey-api/codegen-core';
import tsOld from 'typescript';

import type { ts } from '../../ts-compiler';
import { TsDsl } from '../base';
import { LiteralTsDsl } from '../expr/literal';
import { DocMixin } from '../mixins/doc';

const Mixed = DocMixin(TsDsl<tsOld.LiteralTypeNode>);

export class TypeLiteralTsDsl extends Mixed {
  readonly '~dsl' = 'TypeLiteralTsDsl';
  override scope: NodeScope = 'type';

  protected _hintLines?: ReadonlyArray<string>;
  protected value: ts.LiteralValue;

  constructor(value: ts.LiteralValue) {
    super();
    this.value = value;
  }

  /** Attaches leading single-line `//` comments to this literal type node. */
  hint(lines: ReadonlyArray<string>): this {
    this._hintLines = lines;
    return this;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  override toAst() {
    const node = tsOld.factory.createLiteralTypeNode(this.$node(new LiteralTsDsl(this.value)));
    for (const line of this._hintLines ?? []) {
      tsOld.addSyntheticLeadingComment(
        node,
        tsOld.SyntaxKind.SingleLineCommentTrivia,
        ` ${line}`,
        false,
      );
    }
    return this.$docs(node);
  }
}
