import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import { isSymbol } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { type MaybePyDsl, PyDsl } from '../base';
import { NewlinePyDsl } from '../layout/newline';
import { DecoratorMixin } from '../mixins/decorator';
import { DocMixin } from '../mixins/doc';
import { LayoutMixin } from '../mixins/layout';
import { safeRuntimeName } from '../utils/name';

type Body = Array<MaybePyDsl<py.Statement>>;

const Mixed = DecoratorMixin(DocMixin(LayoutMixin(PyDsl<py.ClassDeclaration>)));

export class ClassPyDsl extends Mixed {
  readonly '~dsl' = 'ClassPyDsl';
  override readonly nameSanitizer = safeRuntimeName;

  protected baseClasses: Array<NodeName> = [];
  protected body: Body = [];

  constructor(name: NodeName) {
    super();
    this.name.set(name);
    if (isSymbol(name)) {
      name.setKind('class');
    }
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const baseClass of this.baseClasses) {
      ctx.analyze(baseClass);
    }
    ctx.analyze(this.name);
    ctx.pushScope();
    try {
      for (const item of this.body) {
        ctx.analyze(item);
      }
    } finally {
      ctx.popScope();
    }
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /** Returns true if the class has any members. */
  get hasBody(): boolean {
    return this.body.length > 0;
  }

  /** Adds one or more class members (fields, methods, etc.). */
  do(...items: Body): this {
    this.body.push(...items);
    return this;
  }

  /** Records base classes to extend from. */
  extends(...baseClass: ReadonlyArray<NodeName>): this {
    this.baseClasses.push(...baseClass);
    return this;
  }

  /** Inserts an empty line between members for formatting. */
  newline(): this {
    this.body.push(new NewlinePyDsl());
    return this;
  }

  override toAst(): py.ClassDeclaration {
    this.$validate();
    // const uniqueClasses: Array<py.Expression> = [];

    // for (const base of baseClass) {
    //   let expr: py.Expression;
    //   if (typeof base === 'string' || base instanceof PyDsl) {
    //     expr = this.$node(base) as py.Expression;
    //   } else if (isSymbol(base)) {
    //     expr = py.factory.createIdentifier(base.finalName);
    //   }

    //   // Avoid duplicates by checking if already added
    //   const exists = uniqueClasses.some((existing) => {
    //     const existingExpr = this.$node(existing) as py.Expression;
    //     return existingExpr === expr;
    //   });

    //   if (!exists) {
    //     uniqueClasses.push(expr);
    //   }
    // }

    return py.factory.createClassDeclaration(
      this.name.toString(),
      this.$node(this.body),
      this.$decorators(),
      this.baseClasses.map((c) => this.$node(c)),
      this.$docs(),
    );
  }

  $validate(): asserts this {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Class declaration missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this.name.toString()) missing.push('name');
    return missing;
  }
}
