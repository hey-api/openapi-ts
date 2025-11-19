import type ts from 'typescript';

import { TsDsl } from '../base';
import { IdTsDsl } from '../expr/id';

export class NewlineTsDsl extends TsDsl<ts.Identifier> {
  $render(): ts.Identifier {
    return this.$node(new IdTsDsl('\n'));
  }
}
