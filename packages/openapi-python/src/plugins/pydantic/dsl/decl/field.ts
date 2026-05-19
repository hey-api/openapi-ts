import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import { toCase } from '@hey-api/shared';

import type { py } from '../../../../py-compiler';
import type { VarType } from '../../../../py-dsl';
import { $, PyDsl } from '../../../../py-dsl';
import type { CallCallee } from '../../../../py-dsl/expr/call';
import { OptionalMixin } from '../../../../py-dsl/mixins/optional';
import { safeRuntimeName } from '../../../../py-dsl/utils/name';
import type { PydanticPlugin } from '../../types';
import { ConstraintsMixin } from '../mixins/constraints';
import { literalize } from '../utils/literal';
import { BASE_MODEL_RESERVED } from '../utils/reserved';

const Mixed = ConstraintsMixin(OptionalMixin(PyDsl<py.Statement>));

export class PydanticFieldDsl extends Mixed {
  readonly '~dsl' = 'PydanticFieldDsl';

  protected plugin: PydanticPlugin['Instance'];

  private _alias?: string;
  private _default: unknown;
  private _defaultFactory?: string;
  private _description?: string;
  private _dsl?: ReturnType<typeof $.var>;
  private _title?: string;
  private _type?: VarType;

  constructor(plugin: PydanticPlugin['Instance'], name: NodeName) {
    super();
    this.name.set(name);
    this.plugin = plugin;
  }

  alias(name: string): this {
    this._alias = name;
    return this;
  }

  default(value: unknown): this {
    this._default = value;
    return this;
  }

  defaultFactory(factory: string): this {
    this._defaultFactory = factory;
    return this;
  }

  description(text: string): this {
    this._description = text;
    return this;
  }

  title(text: string): this {
    this._title = text;
    return this;
  }

  type(type: VarType): this {
    this._type = type;
    return this;
  }

  _build(): ReturnType<typeof $.var> {
    if (this._dsl) return this._dsl;

    const { plugin } = this;

    const name = String(fromRef(this.name));
    const snake = toCase(name, 'snake_case');
    const safe = safeRuntimeName(snake);
    const runtimeName = BASE_MODEL_RESERVED.has(safe) ? `${safe}_` : safe;
    const needsAlias = runtimeName !== name;
    const alias = this._alias ?? (needsAlias ? name : undefined);

    const hasDefault = this._default !== undefined;

    let type = this._type;
    const needsOptional = this._optional || hasDefault;
    if (needsOptional && this._type) {
      type = $(plugin.external('typing.Optional')).slice(this._type);
    }

    const stmt = $.var(plugin.symbol(runtimeName)).$if(type, (v, t) => v.type(t));

    if (
      this._defaultFactory !== undefined ||
      alias !== undefined ||
      this._title !== undefined ||
      this._description !== undefined ||
      this.hasConstraints
    ) {
      const args: Array<CallCallee> = [];

      const isRequired = !needsOptional && !this._defaultFactory;
      if (isRequired) {
        args.push($('...') as CallCallee);
      } else if (hasDefault) {
        args.push($.kwarg('default', literalize(this._default)));
      }

      if (this._defaultFactory) args.push($.kwarg('default_factory', this._defaultFactory));
      if (alias !== undefined) args.push($.kwarg('alias', alias));
      if (this._title !== undefined) args.push($.kwarg('title', this._title));
      if (this._description !== undefined) args.push($.kwarg('description', this._description));

      for (const [k, v] of Object.entries(this.constraints)) {
        args.push($.kwarg(k, v));
      }

      stmt.assign($(plugin.external('pydantic.Field')).call(...args));
    } else if (hasDefault) {
      stmt.assign(literalize(this._default) as string | number);
    } else if (this._optional) {
      stmt.assign('None');
    }

    this._dsl = stmt;

    return this._dsl;
  }

  override analyze(ctx: AnalysisContext): void {
    this._build();
    ctx.analyze(this._dsl!);
    super.analyze(ctx);
  }

  override toAst() {
    this._build();
    return this._dsl!.toAst();
  }
}
