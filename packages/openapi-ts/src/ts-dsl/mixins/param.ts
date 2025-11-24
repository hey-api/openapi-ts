import type { SyntaxNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { ParamTsDsl } from '../decl/param';
import type { BaseCtor, MixinCtor } from './types';

export interface ParamMethods extends SyntaxNode {
  /** Renders the parameters into an array of `ParameterDeclaration`s. */
  $params(): ReadonlyArray<ts.ParameterDeclaration>;
  /** Adds a parameter. */
  param(
    name: string | ((p: ParamTsDsl) => void),
    fn?: (p: ParamTsDsl) => void,
  ): this;
  /** Adds multiple parameters. */
  params(...params: ReadonlyArray<MaybeTsDsl<ts.ParameterDeclaration>>): this;
}

export function ParamMixin<T extends ts.Node, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Param extends Base {
    protected _params: Array<MaybeTsDsl<ts.ParameterDeclaration>> = [];

    protected param(
      name: string | ((p: ParamTsDsl) => void),
      fn?: (p: ParamTsDsl) => void,
    ): this {
      const p = new ParamTsDsl(name, fn);
      this._params.push(p);
      return this;
    }

    protected params(
      ...params: ReadonlyArray<MaybeTsDsl<ts.ParameterDeclaration>>
    ): this {
      this._params.push(...params);
      return this;
    }

    protected $params(): ReadonlyArray<ts.ParameterDeclaration> {
      return this.$node(this._params);
    }
  }

  return Param as unknown as MixinCtor<TBase, ParamMethods>;
}
