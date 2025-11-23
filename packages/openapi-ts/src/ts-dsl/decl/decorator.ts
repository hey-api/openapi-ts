/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging */
import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { ArgsMixin } from '../mixins/args';

export class DecoratorTsDsl extends TsDsl<ts.Decorator> {
  protected name: Symbol | string | MaybeTsDsl<ts.Expression>;

  constructor(
    name: Symbol | string | MaybeTsDsl<ts.Expression>,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ) {
    super();
    this.name = name;
    if (typeof name !== 'string' && 'id' in name) {
      const symbol = this.getRootSymbol();
      if (symbol) symbol.addDependency(name);
    }
    this.args(...args);
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.Decorator {
    const target =
      typeof this.name !== 'string' && 'id' in this.name
        ? this.$maybeId(this.name.finalName)
        : this.$node(this.name);

    const args = this.$args();
    return ts.factory.createDecorator(
      args.length
        ? ts.factory.createCallExpression(target, undefined, args)
        : target,
    );
  }
}

export interface DecoratorTsDsl extends ArgsMixin {}
mixin(DecoratorTsDsl, ArgsMixin);
