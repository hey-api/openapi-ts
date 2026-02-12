import type { AnalysisContext, Node } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { DocFn, DocLines } from '../layout/doc';
import { DocPyDsl } from '../layout/doc';
import type { BaseCtor, MixinCtor } from './types';

export interface DocMethods extends Node {
  $docs(): string | undefined;
  doc(lines?: DocLines, fn?: DocFn): this;
}

export function DocMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Doc extends Base {
    private _doc?: DocPyDsl;

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected doc(lines?: DocLines, fn?: DocFn): this {
      this._doc = new DocPyDsl(lines, fn);
      return this;
    }

    protected $docs(): string | undefined {
      return this._doc ? this._doc.resolve() : undefined;
    }
  }

  return Doc as unknown as MixinCtor<TBase, DocMethods>;
}
