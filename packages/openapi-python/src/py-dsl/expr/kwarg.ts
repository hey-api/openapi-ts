import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';

export type KwargValue = string | number | boolean | null | MaybePyDsl<py.Expression>;

export class KwargPyDsl extends PyDsl<py.KeywordArgument> {
  readonly '~dsl' = 'KwargPyDsl';

  constructor(
    private readonly argName: string,
    private readonly argValue: KwargValue,
  ) {
    super();
  }

  override toAst() {
    return py.factory.createKeywordArgument(this.argName, this.$valueToNode(this.argValue));
  }

  private $valueToNode(value: KwargValue) {
    if (value === null) {
      return py.factory.createIdentifier('None');
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return py.factory.createLiteral(value);
    }
    return this.$node(value);
  }
}
