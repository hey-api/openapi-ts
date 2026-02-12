import type { AnalysisContext, Node, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { BinaryPyDsl } from '../expr/binary';
import type { BaseCtor, MixinCtor } from './types';

type Expr = NodeName | MaybePyDsl<py.Expression>;

export interface OperatorMethods extends Node {
  and(expr: Expr): BinaryPyDsl;
  div(expr: Expr): BinaryPyDsl;
  eq(expr: Expr): BinaryPyDsl;
  floordiv(expr: Expr): BinaryPyDsl;
  gt(expr: Expr): BinaryPyDsl;
  gte(expr: Expr): BinaryPyDsl;
  in_(expr: Expr): BinaryPyDsl;
  is(expr: Expr): BinaryPyDsl;
  isNot(expr: Expr): BinaryPyDsl;
  lt(expr: Expr): BinaryPyDsl;
  lte(expr: Expr): BinaryPyDsl;
  minus(expr: Expr): BinaryPyDsl;
  mod(expr: Expr): BinaryPyDsl;
  neq(expr: Expr): BinaryPyDsl;
  notIn(expr: Expr): BinaryPyDsl;
  or(expr: Expr): BinaryPyDsl;
  plus(expr: Expr): BinaryPyDsl;
  pow(expr: Expr): BinaryPyDsl;
  times(expr: Expr): BinaryPyDsl;
}

export function OperatorMixin<T extends py.Expression, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Operator extends Base {
    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected and(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        'and',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected div(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '/',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected eq(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '==',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected floordiv(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '//',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected gt(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '>',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected gte(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '>=',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected in_(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        'in',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected is(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        'is',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected isNot(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        'is not',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected lt(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '<',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected lte(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '<=',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected minus(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '-',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected mod(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '%',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected neq(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '!=',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected notIn(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        'not in',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected or(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        'or',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected plus(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '+',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected pow(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '**',
        expr as MaybePyDsl<py.Expression>,
      );
    }

    protected times(expr: Expr): BinaryPyDsl {
      return new BinaryPyDsl(
        this as unknown as MaybePyDsl<py.Expression>,
        '*',
        expr as MaybePyDsl<py.Expression>,
      );
    }
  }

  return Operator as unknown as MixinCtor<TBase, OperatorMethods>;
}
