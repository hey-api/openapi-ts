import type { AnalysisContext, NodeName, NodeScope, Ref } from '@hey-api/codegen-core';
import { isSymbol, ref } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl, TypeTsDsl } from '../base';
import { TsDsl } from '../base';
import { DocMixin } from '../mixins/doc';
import { ExportMixin } from '../mixins/modifiers';
import { TypeParamsMixin } from '../mixins/type-params';
import { safeTypeName } from '../utils/name';

type Body = Array<MaybeTsDsl<ts.TypeElement>>;
type ExtendsName = NodeName;
type ExtendsTypeArg = NodeName | MaybeTsDsl<TypeTsDsl>;

const Mixed = DocMixin(ExportMixin(TypeParamsMixin(TsDsl<ts.InterfaceDeclaration>)));

export class InterfaceTsDsl extends Mixed {
  readonly '~dsl' = 'InterfaceTsDsl';
  override readonly nameSanitizer = safeTypeName;
  override scope: NodeScope = 'type';

  protected _body: Body = [];
  protected _extendsName?: Ref<ExtendsName>;
  protected _extendsTypeArgs?: Array<ExtendsTypeArg>;

  constructor(name: NodeName, fn?: (i: InterfaceTsDsl) => void) {
    super();
    this.name.set(name);
    if (isSymbol(name)) {
      name.setKind('type');
    }
    fn?.(this);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.name);
    ctx.analyze(this._extendsName);
    for (const member of this._body) {
      ctx.analyze(member);
    }
  }

  do(...members: Body): this {
    this._body.push(...members);
    return this;
  }

  extends(name: ExtendsName, typeArgs?: Array<ExtendsTypeArg>): this {
    this._extendsName = ref(name);
    this._extendsTypeArgs = typeArgs;
    return this;
  }

  override toAst() {
    const heritage = this._buildHeritage();
    const members = this.$node(this._body) as ReadonlyArray<ts.TypeElement>;
    const node = ts.factory.createInterfaceDeclaration(
      this.modifiers,
      this.$node(this.name) as ts.Identifier,
      this.$generics(),
      heritage,
      members,
    );
    return this.$docs(node);
  }

  private _buildHeritage(): ReadonlyArray<ts.HeritageClause> {
    if (!this._extendsName) return [];
    const exprNode = this.$node(this._extendsName) as ts.Expression;
    const typeArgs = this._extendsTypeArgs
      ? (this.$type(this._extendsTypeArgs) as unknown as ReadonlyArray<ts.TypeNode>)
      : undefined;
    return [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(exprNode, typeArgs),
      ]),
    ];
  }
}
