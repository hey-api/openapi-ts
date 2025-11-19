import type ts from 'typescript';

import { type MaybeTsDsl, TsDsl } from '../base';
import { ParamTsDsl } from '../decl/param';

export class ParamMixin extends TsDsl {
  protected _params?: Array<MaybeTsDsl<ts.ParameterDeclaration>>;

  /** Adds a parameter. */
  param(
    name: string | ((p: ParamTsDsl) => void),
    fn?: (p: ParamTsDsl) => void,
  ): this {
    const p = new ParamTsDsl(name, fn);
    (this._params ??= []).push(p);
    return this;
  }

  /** Adds multiple parameters. */
  params(...params: ReadonlyArray<MaybeTsDsl<ts.ParameterDeclaration>>): this {
    (this._params ??= []).push(...params);
    return this;
  }

  /** Renders the parameters into an array of `ParameterDeclaration`s. */
  protected $params(): ReadonlyArray<ts.ParameterDeclaration> {
    if (!this._params) return [];
    return this.$node(this._params);
  }

  $render(): ts.Node {
    throw new Error('noop');
  }
}
