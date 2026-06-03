import type { NodeName } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { RString } from '../utils/r-string';

export type KwargValue = string | number | boolean | null | RString | MaybePyDsl<py.Expression>;

const Mixed = PyDsl<py.KeywordArgument>;

export class KwargPyDsl extends Mixed {
  readonly '~dsl' = 'KwargPyDsl';

  protected _value: KwargValue;

  constructor(name: NodeName, value: KwargValue) {
    super();
    this.name.set(name);
    this._value = value;
  }

  get key(): string {
    return this.name.toString();
  }

  override toAst() {
    return py.factory.createKeywordArgument(this.name.toString(), this.$valueToNode(this._value));
  }

  private $valueToNode(value: KwargValue) {
    if (value instanceof RString) {
      return py.factory.createRStringExpression(value.value);
    }
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
