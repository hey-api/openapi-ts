import type { AnalysisContext, Node } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeArray } from '../base';
import { NoteTsDsl } from '../layout/note';
import type { BaseCtor, MixinCtor } from './types';

export interface NoteMethods extends Node {
  $note<T extends ts.Node>(node: T): T;
  note(lines?: MaybeArray<string>, fn?: (h: NoteTsDsl) => void): this;
}

export function NoteMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Note extends Base {
    private _note?: NoteTsDsl;

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected note(
      lines?: MaybeArray<string>,
      fn?: (h: NoteTsDsl) => void,
    ): this {
      this._note = new NoteTsDsl(lines, fn);
      return this;
    }

    protected $note<T extends ts.Node>(node: T): T {
      return this._note ? this._note.apply(node) : node;
    }
  }

  return Note as unknown as MixinCtor<TBase, NoteMethods>;
}
