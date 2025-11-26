import type { AnalysisContext } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { isTsDsl, TsDsl, TypeTsDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DocMixin } from '../mixins/doc';
import {
  PrivateMixin,
  ProtectedMixin,
  PublicMixin,
  ReadonlyMixin,
  StaticMixin,
} from '../mixins/modifiers';
import { ValueMixin } from '../mixins/value';
import type { TypeExprName } from '../type/expr';
import { TypeExprTsDsl } from '../type/expr';

export type FieldType = TypeExprName | TypeTsDsl;

const Mixed = DecoratorMixin(
  DocMixin(
    PrivateMixin(
      ProtectedMixin(
        PublicMixin(
          ReadonlyMixin(StaticMixin(ValueMixin(TsDsl<ts.PropertyDeclaration>))),
        ),
      ),
    ),
  ),
);

export class FieldTsDsl extends Mixed {
  protected name: string;
  protected _type?: TypeTsDsl;

  constructor(name: string, fn?: (f: FieldTsDsl) => void) {
    super();
    this.name = name;
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    if (isSymbol(this._type)) {
      ctx.addDependency(this._type);
    } else if (isTsDsl(this._type)) {
      this._type.analyze(ctx);
    }
  }

  /** Sets the field type. */
  type(type: FieldType): this {
    this._type = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  protected override _render() {
    return ts.factory.createPropertyDeclaration(
      [...this.$decorators(), ...this.modifiers],
      this.name,
      undefined,
      this.$type(this._type),
      this.$value(),
    );
  }
}
