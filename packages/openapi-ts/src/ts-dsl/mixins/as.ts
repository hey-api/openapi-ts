import type ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import type { AsTsDsl } from '../expr/as';

type AsFactory = (
  expr: string | MaybeTsDsl<ts.Expression>,
  type: string | TypeTsDsl,
) => AsTsDsl;
let asFactory: AsFactory | undefined;
/** Registers the As DSL factory after its module has finished evaluating. */
export function registerLazyAccessAsFactory(factory: AsFactory): void {
  asFactory = factory;
}

export class AsMixin {
  /** Creates an `as` type assertion expression (e.g. `value as Type`). */
  as(
    this: string | MaybeTsDsl<ts.Expression>,
    type: string | TypeTsDsl,
  ): AsTsDsl {
    return asFactory!(this, type);
  }
}
