/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';

export class DecoratorTsDsl extends TsDsl<ts.Decorator> {
  private name: string | ts.Expression;

  constructor(
    name: string | ts.Expression,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ) {
    super();
    this.name = name;
    this.args(...args);
  }

  $render(): ts.Decorator {
    const args = this.$args();
    return ts.factory.createDecorator(
      args.length
        ? ts.factory.createCallExpression(
            this.$maybeId(this.name),
            undefined,
            args,
          )
        : this.$maybeId(this.name),
    );
  }
}

export interface DecoratorTsDsl extends ArgsMixin {}
mixin(DecoratorTsDsl, ArgsMixin);
