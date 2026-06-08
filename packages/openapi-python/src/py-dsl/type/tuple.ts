import type { AnalysisContext, NodeName, NodeScope, Ref, Symbol } from '@hey-api/codegen-core';
import { fromRef, ref } from '@hey-api/codegen-core';

import type { py } from '../../py-compiler';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { f } from '../utils/factories';

const Mixed = PyDsl<py.Expression>;

type Type = NodeName | MaybePyDsl<py.Expression>;

type TypeTupleDecision =
  | { strategy: 'empty' }
  | { anySymbol: Symbol; strategy: 'variadic' }
  | { strategy: 'fixed' };

export class TypeTuplePyDsl extends Mixed {
  readonly '~dsl' = 'TypeTuplePyDsl';
  override scope: NodeScope = 'type';

  protected _items: Array<Ref<Type>> = [];
  private _decision?: TypeTupleDecision;

  constructor(...nodes: Array<Type>) {
    super();
    this.items(...nodes);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const item of this._items) {
      ctx.analyze(item);
    }

    if (!this._items.length) {
      this._decision = { strategy: 'empty' };
    } else {
      const flat = this.$flattenRefs(this._items);
      const allResolved = flat.every((r) => fromRef(r) !== undefined);

      if (!allResolved) {
        const anySymbol = this.meta.symbols.typing.Any;
        ctx.analyze(anySymbol);
        this._decision = { anySymbol, strategy: 'variadic' };
      } else {
        this._decision = { strategy: 'fixed' };
      }
    }
  }

  items(...nodes: Array<Type>): this {
    this._items.push(...nodes.map((n) => ref(n)));
    return this;
  }

  override toAst() {
    this.$validate();

    const decision = this._decision!;

    if (decision.strategy === 'empty') {
      return this.$node(f.slice('tuple', f.tuple()));
    }

    if (decision.strategy === 'variadic') {
      return this.$node(f.slice('tuple', decision.anySymbol, '...'));
    }

    const flat = this.$flatten(this._items);
    return this.$node(f.slice('tuple', ...flat));
  }

  $validate(): asserts this {
    if (this._decision === undefined) {
      throw new Error('TypeTuplePyDsl has not been analyzed');
    }
  }

  private $flatten(items: Array<Ref<Type>>): Array<py.Expression> {
    return items.map((t) => this.$node(t));
  }

  private $flattenRefs(items: Array<Ref<Type>>): Array<Ref<Type>> {
    return items;
  }
}
