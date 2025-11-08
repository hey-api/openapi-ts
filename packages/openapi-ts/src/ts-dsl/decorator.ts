/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { ArgsMixin } from './mixins/args';

export class DecoratorTsDsl extends TsDsl<ts.Decorator> {
  private name: WithString;

  constructor(
    name: WithString,
    ...args: ReadonlyArray<MaybeTsDsl<WithString>>
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
            this.$expr(this.name),
            undefined,
            args,
          )
        : this.$expr(this.name),
    );
  }
}

export interface DecoratorTsDsl extends ArgsMixin {}
mixin(DecoratorTsDsl, ArgsMixin);
