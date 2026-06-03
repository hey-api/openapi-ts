import type { NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import type { MaybePyDsl } from '../../../../py-dsl';
import { PydanticConstraintsDsl } from './constraints';

export class PydanticConstrainedTypeDsl {
  readonly '~dsl' = 'PydanticConstrainedTypeDsl';

  readonly constraints: PydanticConstraintsDsl;
  readonly type: NodeName | MaybePyDsl<py.Expression>;

  constructor(
    type: NodeName | MaybePyDsl<py.Expression>,
    constraints: PydanticConstraintsDsl = new PydanticConstraintsDsl(),
  ) {
    this.constraints = constraints;
    this.type = type;
  }

  mergeConstraints(constraints: PydanticConstraintsDsl): this {
    this.constraints.merge(constraints);
    return this;
  }
}
