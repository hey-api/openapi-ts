import type ts from 'typescript';

import type { MaybeArray } from '../base';
import { NoteTsDsl } from '../layout/note';
import type { BaseCtor, MixinCtor } from './types';

export interface NoteMethods {
  note(lines?: MaybeArray<string>, fn?: (h: NoteTsDsl) => void): this;
}

export function NoteMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Note extends Base {
    protected _note?: NoteTsDsl;

    protected note(
      lines?: MaybeArray<string>,
      fn?: (h: NoteTsDsl) => void,
    ): this {
      this._note = new NoteTsDsl(lines, fn);
      return this;
    }

    protected override _render() {
      const node = this.$render();
      return this._note ? this._note.apply(node) : node;
    }
  }

  return Note as unknown as MixinCtor<TBase, NoteMethods>;
}
