/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { mixin } from '../mixins/apply';
import { DocMixin } from '../mixins/doc';
import { ParamMixin } from '../mixins/param';
import { TypeParamsMixin } from '../mixins/type-params';
import { TypeExprTsDsl } from './expr';

export class TypeFuncTsDsl extends TypeTsDsl<ts.FunctionTypeNode> {
  protected _returns?: TypeTsDsl;

  /** Sets the return type. */
  returns(type: string | TypeTsDsl): this {
    this._returns = type instanceof TypeTsDsl ? type : new TypeExprTsDsl(type);
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.FunctionTypeNode {
    if (this._returns === undefined) {
      throw new Error('Missing return type in function type DSL');
    }
    return ts.factory.createFunctionTypeNode(
      this.$generics(),
      this.$params(),
      this.$type(this._returns),
    );
  }
}

export interface TypeFuncTsDsl extends DocMixin, ParamMixin, TypeParamsMixin {}
mixin(TypeFuncTsDsl, DocMixin, ParamMixin, TypeParamsMixin);
