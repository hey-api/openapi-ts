import type { Symbol, SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TsDsl } from '../base';
import { ArgsMixin } from '../mixins/args';

const Mixed = ArgsMixin(TsDsl<ts.Decorator>);

export class DecoratorTsDsl extends Mixed {
  protected name: Symbol | string | MaybeTsDsl<ts.Expression>;

  constructor(
    name: Symbol | string | MaybeTsDsl<ts.Expression>,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression>>
  ) {
    super();
    this.name = name;
    if (typeof name !== 'string' && 'id' in name) {
      this.getRootSymbol().addDependency(name);
    }
    this.args(...args);
  }

  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  protected override _render() {
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
