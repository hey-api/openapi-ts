import type { AnalysisContext } from '@hey-api/codegen-core';
import type { MaybeArray } from '@hey-api/types';

import { py } from '../../ts-python';
import { PyDsl } from '../base';
import type { PyDslContext } from '../utils/context';
import { ctx } from '../utils/context';

type HintMaybeLazy<T> = ((ctx: PyDslContext) => T) | T;
export type HintFn = (d: HintPyDsl) => void;
export type HintLines = HintMaybeLazy<MaybeArray<string>>;

export class HintPyDsl extends PyDsl<py.Comment> {
  readonly '~dsl' = 'HintPyDsl';

  protected _lines: Array<HintLines> = [];

  constructor(lines?: HintLines, fn?: HintFn) {
    super();
    if (lines) this.add(lines);
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
  }

  add(lines: HintLines): this {
    this._lines.push(lines);
    return this;
  }

  apply<T extends py.Node>(node: T): T {
    const lines = this._resolveLines();
    if (!lines.length) return node;

    const existing = node.leadingComments ? [...node.leadingComments] : [];
    existing.push(...lines);
    node.leadingComments = existing;
    return node;
  }

  override toAst() {
    // Return a dummy comment node for compliance.
    const lines = this._resolveLines();
    return py.factory.createComment(lines.join('\n'));
  }

  private _resolveLines(): Array<string> {
    return this._lines.reduce((lines: Array<string>, line: HintLines) => {
      if (typeof line === 'function') line = line(ctx);
      for (const l of typeof line === 'string' ? [line] : line) {
        if (l || l === '') lines.push(l);
      }
      return lines;
    }, []);
  }
}
