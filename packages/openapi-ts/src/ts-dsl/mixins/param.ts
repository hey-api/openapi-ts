import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { ParamTsDsl } from '../param';

export class ParamMixin {
  protected _params?: Array<MaybeTsDsl<ts.ParameterDeclaration>>;

  /** Adds a parameter. */
  param(name: string, fn?: (p: ParamTsDsl) => void): this {
    const p = new ParamTsDsl(name, fn);
    if (!this._params) this._params = [];
    this._params.push(p);
    return this;
  }

  /** Adds multiple parameters. */
  params(...params: ReadonlyArray<MaybeTsDsl<ts.ParameterDeclaration>>): this {
    if (!this._params) this._params = [];
    this._params.push(...params);
    return this;
  }
}
