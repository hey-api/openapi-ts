import type { AnalysisContext, Node } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { AsCtor, AsTsDsl, AsType } from '../expr/as';
import type { BaseCtor, MixinCtor } from './types';

let asFactory: AsCtor | undefined;
/** Lazy register the factory to avoid circular imports. */
export function setAsFactory(factory: AsCtor): void {
  asFactory = factory;
}

export interface AsMethods extends Node {
  /** Creates an `as` type assertion expression (e.g. `value as Type`). */
  as(type: AsType): AsTsDsl;
}

export function AsMixin<T extends ts.Expression, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class As extends Base {
    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected as(type: AsType): AsTsDsl {
      return asFactory!(this, type);
    }
  }

  return As as unknown as MixinCtor<TBase, AsMethods>;
}
