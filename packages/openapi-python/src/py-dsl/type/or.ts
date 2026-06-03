import type { AnalysisContext, NodeName, NodeScope, Ref, Symbol } from '@hey-api/codegen-core';
import { fromRef, ref } from '@hey-api/codegen-core';

import type { py } from '../../py-compiler';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import { f } from '../utils/factories';

const Mixed = PyDsl<py.Expression>;

type Type = NodeName | MaybePyDsl<py.Expression>;

type TypeOrDecision =
  | {
      strategy: 'identity' | 'bitor';
    }
  | {
      strategy: 'typing';
      unionSymbol: Symbol;
    };

export class TypeOrPyDsl extends Mixed {
  readonly '~dsl' = 'TypeOrPyDsl';
  override scope: NodeScope = 'type';

  protected _types: Array<Ref<Type>> = [];
  private _decision?: TypeOrDecision;

  constructor(...nodes: Array<Type>) {
    super();
    this.types(...nodes);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const type of this._types) {
      ctx.analyze(type);
    }

    const flat = this.$flattenRefs(this._types);
    if (flat.length === 1) {
      this._decision = { strategy: 'identity' };
    } else if (this.meta.Version.gte('3.10')) {
      this._decision = { strategy: 'bitor' };
    } else if (this.meta.Version.lte('3.9')) {
      const unionSymbol = this.meta.symbols.typing.Union;
      ctx.analyze(unionSymbol);
      this._decision = { strategy: 'typing', unionSymbol };
    }
  }

  types(...nodes: Array<Type>): this {
    this._types.push(...nodes.map((n) => ref(n)));
    return this;
  }

  override toAst() {
    this.$validate();

    const decision = this._decision!;
    const flat = this.$flatten(this._types);

    if (decision.strategy === 'identity') {
      return flat[0]!;
    }

    if (decision.strategy === 'bitor') {
      return this.$node(
        flat
          .slice(1)
          .reduce<MaybePyDsl<py.Expression>>((left, right) => f.binary(left, '|', right), flat[0]!),
      );
    }

    if (decision.strategy === 'typing') {
      const slice = this.$node(f.slice(decision.unionSymbol, ...flat));
      return slice;
    }

    throw new Error('Invalid strategy');
  }

  $validate(): asserts this {
    if (!this._types.length) {
      throw new Error('Or type requires at least one member type');
    }
  }

  private $flatten(types: Array<Ref<Type>>): Array<py.Expression> {
    const flat: Array<py.Expression> = [];
    for (const t of types) {
      const node = fromRef(t);
      if (node instanceof TypeOrPyDsl) {
        flat.push(...this.$flatten(node._types));
      } else {
        flat.push(this.$node(t));
      }
    }
    return flat;
  }

  private $flattenRefs(types: Array<Ref<Type>>): Array<Ref<Type>> {
    const flat: Array<Ref<Type>> = [];
    for (const t of types) {
      const node = fromRef(t);
      if (node instanceof TypeOrPyDsl) {
        flat.push(...this.$flattenRefs(node._types));
      } else {
        flat.push(t);
      }
    }
    return flat;
  }
}
