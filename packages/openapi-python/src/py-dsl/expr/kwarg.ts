import type { NodeName } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';

export type KwargValue = string | number | boolean | null | MaybePyDsl<py.Expression>;

export class KwargPyDsl extends PyDsl<py.KeywordArgument> {
  readonly '~dsl' = 'KwargPyDsl';

  protected _value: KwargValue;

  constructor(name: NodeName, value: KwargValue) {
    super();
    this.name.set(name);
    this._value = value;
  }

  override toAst() {
    const name = this.name.toString();
    return py.factory.createKeywordArgument(name, this.$valueToNode(this._value));
  }

  private $valueToNode(value: KwargValue) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      return py.factory.createLiteral(value);
    }
    return this.$node(value);
  }
}
