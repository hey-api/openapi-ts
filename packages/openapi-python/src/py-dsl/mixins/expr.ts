import type { AnalysisContext, Node } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { CallPyDsl } from '../expr/call';
import { AttrPyDsl } from '../expr/member';
import type { BaseCtor, MixinCtor } from './types';

export interface ExprMethods extends Node {
  attr(object: MaybePyDsl<py.Expression>, prop: string): AttrPyDsl;
  call(callee: MaybePyDsl<py.Expression>, ...args: Array<MaybePyDsl<py.Expression>>): CallPyDsl;
}

export function ExprMixin<T extends py.Expression, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Expr extends Base {
    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected attr(object: MaybePyDsl<py.Expression>, prop: string): AttrPyDsl {
      return AttrPyDsl.attr(object, prop);
    }

    protected call(
      callee: MaybePyDsl<py.Expression>,
      ...args: Array<MaybePyDsl<py.Expression>>
    ): CallPyDsl {
      return new CallPyDsl(callee, ...args);
    }
  }

  return Expr as unknown as MixinCtor<TBase, ExprMethods>;
}
