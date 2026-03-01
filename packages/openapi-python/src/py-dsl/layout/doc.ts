import type { AnalysisContext } from '@hey-api/codegen-core';
import type { MaybeArray } from '@hey-api/types';

import { py } from '../../ts-python';
import { PyDsl } from '../base';
import type { PyDslContext } from '../utils/context';
import { ctx } from '../utils/context';

type DocMaybeLazy<T> = ((ctx: PyDslContext) => T) | T;
export type DocFn = (d: DocPyDsl) => void;
export type DocLines = DocMaybeLazy<MaybeArray<string>>;

export class DocPyDsl extends PyDsl<py.Comment> {
  readonly '~dsl' = 'DocPyDsl';

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

  resolve(): string | undefined {
    const lines = this._lines.reduce((lines: Array<string>, line: DocLines) => {
      if (typeof line === 'function') line = line(ctx);
      for (const l of typeof line === 'string' ? [line] : line) {
        if (l || l === '') lines.push(l);
      }
      return lines;
    }, []);
    if (!lines.length) return undefined;
    return lines.join('\n');
  }

  override toAst() {
    // Return a dummy comment node for compliance.
    return py.factory.createComment(this.resolve() ?? '');
    // return this.$node(new IdTsDsl(''));
  }
}
