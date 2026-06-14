import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';

import type { py } from '../../../../py-compiler';
import { $, PyDsl } from '../../../../py-dsl';
import { DocMixin } from '../../../../py-dsl/mixins/doc';
import type { PydanticPlugin } from '../../types';
import { identifiers } from '../../v2/constants';
import type { PydanticConstrainedTypeDsl } from '../expr/constrained-type';
import { PydanticFieldDsl } from './field';

const Mixed = DocMixin(PyDsl<py.ClassDeclaration>);

export class PydanticRootModelDsl extends Mixed {
  readonly '~dsl' = 'PydanticRootModelDsl';

  protected plugin: PydanticPlugin['Instance'];

  private _discriminator?: string;
  private _dsl?: ReturnType<typeof $.class>;
  private _type?: PydanticConstrainedTypeDsl;

  constructor(plugin: PydanticPlugin['Instance'], name: NodeName) {
    super();
    this.plugin = plugin;
    this.name.set(name);
  }

  type(constrainedType: PydanticConstrainedTypeDsl): this {
    this._type = constrainedType;
    return this;
  }

  discriminator(field: string): this {
    this._discriminator = field;
    return this;
  }

  _build(): ReturnType<typeof $.class> {
    if (this._dsl) return this._dsl;

    const { plugin } = this;

    const rootModelBase = $(plugin.imports.RootModel).slice(
      this._type?.type ?? plugin.imports.typing.Any,
    );

    const rootField = new PydanticFieldDsl(plugin, identifiers.root)
      .$if(this._type !== undefined, (f) => f.type(this._type!))
      .$if(this._discriminator !== undefined, (f) => f.discriminator(this._discriminator!));

    this._dsl = $.class(this.name)
      .extends(rootModelBase)
      .$if(this.$docs(), (c, v) => c.doc(v))
      .do(rootField);

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
