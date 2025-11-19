import ts from 'typescript';

import { TsDsl } from '../base';

export class IdTsDsl extends TsDsl<ts.Identifier> {
  protected name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  $render(): ts.Identifier {
    return ts.factory.createIdentifier(this.name);
  }
}
