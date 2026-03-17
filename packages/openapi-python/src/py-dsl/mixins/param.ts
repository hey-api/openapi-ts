import type { AnalysisContext, Node } from '@hey-api/codegen-core';

import type { py } from '../../py-compiler';
import type { MaybePyDsl } from '../base';
import type { ParamCtor, ParamFn, ParamName } from '../decl/param';
import { ParamPyDsl } from '../decl/param';
import type { BaseCtor, MixinCtor } from './types';

export interface ParamMethods extends Node {
  /** Renders the parameters into an array of `FunctionParameter`s. */
  $params(): ReadonlyArray<py.FunctionParameter>;
  /** Adds a parameter. */
  param(...args: Parameters<ParamCtor>): this;
  /** Adds multiple parameters. */
  params(...params: ReadonlyArray<MaybePyDsl<py.FunctionParameter>>): this;
}

export function ParamMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Param extends Base {
    protected _params: Array<MaybePyDsl<py.FunctionParameter>> = [];

    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      for (const param of this._params) {
        ctx.analyze(param);
      }
    }

    protected param(name: ParamName, fn?: ParamFn): this {
      const p = typeof name === 'function' ? new ParamPyDsl(name) : new ParamPyDsl(name, fn);
      this._params.push(p);
      return this;
    }

    protected params(...params: ReadonlyArray<MaybePyDsl<py.FunctionParameter>>): this {
      this._params.push(...params);
      return this;
    }

    protected $params(): ReadonlyArray<py.FunctionParameter> {
      return this.$node(this._params);
    }
  }

  return Param as unknown as MixinCtor<TBase, ParamMethods>;
}
