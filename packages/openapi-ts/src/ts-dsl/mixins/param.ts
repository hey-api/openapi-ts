import type ts from 'typescript';

import type { TypeOfTsDsl } from '../base';
import { type MaybeTsDsl, TsDsl } from '../base';
import { ParamTsDsl } from '../param';

export class ParamMixin extends TsDsl {
  private _params?: Array<MaybeTsDsl<TypeOfTsDsl<ParamTsDsl>>>;

  /** Adds a parameter. */
  param(...args: ConstructorParameters<typeof ParamTsDsl>): this {
    const p = new ParamTsDsl(...args);
    (this._params ??= []).push(p);
    return this;
  }

  /** Adds multiple parameters. */
  params(...params: ReadonlyArray<MaybeTsDsl<TypeOfTsDsl<ParamTsDsl>>>): this {
    (this._params ??= []).push(...params);
    return this;
  }

  /** Renders the parameters into an array of `ParameterDeclaration`s. */
  protected $params(): ReadonlyArray<TypeOfTsDsl<ParamTsDsl>> {
    if (!this._params) return [];
    return this.$node(this._params);
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
