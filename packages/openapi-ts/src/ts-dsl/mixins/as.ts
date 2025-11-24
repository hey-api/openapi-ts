import type { SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import type { AsTsDsl } from '../expr/as';
import type { BaseCtor, MixinCtor } from './types';

type AsFactory = (
  expr: string | MaybeTsDsl<ts.Expression>,
  type: string | TypeTsDsl,
) => AsTsDsl;
let asFactory: AsFactory | undefined;
/** Registers the As DSL factory after its module has finished evaluating. */
export function registerLazyAccessAsFactory(factory: AsFactory): void {
  asFactory = factory;
}

export interface AsMethods extends SyntaxNode {
  /** Creates an `as` type assertion expression (e.g. `value as Type`). */
  as(type: string | TypeTsDsl): AsTsDsl;
}

export function AsMixin<T extends ts.Expression, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class As extends Base {
    protected as(type: string | TypeTsDsl): AsTsDsl {
      return asFactory!(this, type);
    }

    override traverse(visitor: (node: SyntaxNode) => void): void {
      super.traverse(visitor);
    }
  }

  return As as unknown as MixinCtor<TBase, AsMethods>;
}
