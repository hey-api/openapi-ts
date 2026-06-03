import type { AnalysisContext, NodeName, Ref } from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';

import { py } from '../../py-compiler';
import { PyDsl } from '../base';
import { DecoratorMixin } from '../mixins/decorator';
import { DocMixin } from '../mixins/doc';
import { LayoutMixin } from '../mixins/layout';
import { ExportMixin } from '../mixins/modifiers';
import { safeRuntimeName } from '../utils/name';

export type EnumMember = {
  name: NodeName;
  value: number | string | boolean;
};

type EnumDecision =
  | { baseRefs: Array<Ref<NodeName>>; strategy: 'StrEnum' }
  | { baseRefs: Array<Ref<NodeName>>; strategy: 'IntEnum' }
  | { baseRefs: Array<Ref<NodeName>>; enumSymbol: NodeName; strategy: 'str+Enum' }
  | { baseRefs: Array<Ref<NodeName>>; enumSymbol: NodeName; strategy: 'int+Enum' }
  | { baseRefs: Array<Ref<NodeName>>; enumSymbol: NodeName; strategy: 'Enum' };

const Mixed = DecoratorMixin(DocMixin(ExportMixin(LayoutMixin(PyDsl<py.ClassDeclaration>))));

export class EnumPyDsl extends Mixed {
  readonly '~dsl' = 'EnumPyDsl';
  override readonly nameSanitizer = safeRuntimeName;

  private _decision?: EnumDecision;
  private _members: Array<EnumMember> = [];

  constructor(name: NodeName) {
    super();
    this.name.set(name);
    if (isSymbol(name)) {
      name.setKind('class');
    }
  }

  members(...members: ReadonlyArray<EnumMember>): this {
    this._members.push(...members);
    return this;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);

    const hasStrings = this._members.some((m) => typeof m.value === 'string');
    const hasNumbers = this._members.some((m) => typeof m.value === 'number');
    const isMixed = hasStrings && hasNumbers;

    if (!isMixed && hasStrings) {
      if (this.meta.Version.gte('3.11')) {
        this._decision = { baseRefs: [ref(this.meta.symbols.enum.StrEnum)], strategy: 'StrEnum' };
      } else {
        this._decision = {
          baseRefs: [ref('str'), ref(this.meta.symbols.enum.Enum)],
          enumSymbol: this.meta.symbols.enum.Enum,
          strategy: 'str+Enum',
        };
      }
    } else if (!isMixed && hasNumbers) {
      if (this.meta.Version.gte('3.11')) {
        this._decision = { baseRefs: [ref(this.meta.symbols.enum.IntEnum)], strategy: 'IntEnum' };
      } else {
        this._decision = {
          baseRefs: [ref('int'), ref(this.meta.symbols.enum.Enum)],
          enumSymbol: this.meta.symbols.enum.Enum,
          strategy: 'int+Enum',
        };
      }
    } else {
      this._decision = {
        baseRefs: [ref(this.meta.symbols.enum.Enum)],
        enumSymbol: this.meta.symbols.enum.Enum,
        strategy: 'Enum',
      };
    }

    for (const r of this._decision.baseRefs) {
      ctx.analyze(r);
    }
    for (const m of this._members) {
      ctx.analyze(ref(m.name));
    }

    ctx.analyze(this.name);
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return !this.missingRequiredCalls().length;
  }

  override toAst() {
    this.$validate();

    const decision = this._decision!;

    const body = this._members.map((m) =>
      py.factory.createAssignment(this.$node(m.name), undefined, py.factory.createLiteral(m.value)),
    );

    return py.factory.createClassDeclaration(
      this.name.toString(),
      body,
      this.$decorators(),
      decision.baseRefs.map((r) => this.$node(r)),
      this.$docs(),
    );
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (!missing.length) return;
    throw new Error(`Enum declaration missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.name.toString()) missing.push('name');
    if (!this._decision) missing.push('analyze');
    return missing;
  }
}
