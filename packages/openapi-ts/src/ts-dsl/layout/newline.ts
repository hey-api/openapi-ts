import ts from 'typescript';

import { TsDsl } from '../base';

export class NewlineTsDsl extends TsDsl<ts.Identifier> {
  $render(): ts.Identifier {
    return ts.factory.createIdentifier('\n');
  }
}
