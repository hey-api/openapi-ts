import type { AnalysisContext, AstContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeArray } from '../base';
import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

type DocMaybeLazy<T> = ((ctx: AstContext) => T) | T;
export type DocFn = (d: DocTsDsl) => void;
export type DocLines = DocMaybeLazy<MaybeArray<string>>;

export class DocTsDsl extends TsDsl<ts.Node> {
  readonly '~dsl' = 'DocTsDsl';

  protected _lines: Array<DocLines> = [];

  constructor(lines?: DocLines, fn?: DocFn) {
    super();
    if (lines) this.add(lines);
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  add(lines: DocLines): this {
    this._lines.push(lines);
    return this;
  }

  apply<T extends ts.Node>(ctx: AstContext, node: T): T {
    const lines = this._lines.reduce((lines: Array<string>, line: DocLines) => {
      if (typeof line === 'function') line = line(ctx);
      for (const l of typeof line === 'string' ? [line] : line) {
        if (l || l === '') lines.push(l);
      }
      return lines;
    }, []);
    if (!lines.length) return node;

    const jsdocTexts = lines.map((line) =>
      ts.factory.createJSDocText(`${line}\n`),
    );

    const jsdoc = ts.factory.createJSDocComment(
      ts.factory.createNodeArray(jsdocTexts),
      undefined,
    );

    const cleanedJsdoc = ts
      .createPrinter()
      .printNode(
        ts.EmitHint.Unspecified,
        jsdoc,
        node.getSourceFile?.() ??
          ts.createSourceFile('', '', ts.ScriptTarget.Latest),
      )
      .replace('/*', '')
      .replace('*  */', '');

    ts.addSyntheticLeadingComment(
      node,
      ts.SyntaxKind.MultiLineCommentTrivia,
      cleanedJsdoc,
      true,
    );

    return node;
  }

  override toAst(ctx: AstContext): ts.Node {
    // this class does not build a standalone node;
    // it modifies other nodes via `apply()`.
    // Return a dummy comment node for compliance.
    return this.$node(ctx, new IdTsDsl(''));
  }
}
