import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { TypeIdxSigTsDsl } from './idx-sig';
import { TypePropTsDsl } from './prop';

export class TypeObjectTsDsl extends TypeTsDsl<ts.TypeNode> {
  protected props: Array<TypePropTsDsl | TypeIdxSigTsDsl> = [];

  /** Returns true if object has at least one property or spread. */
  hasProps(): boolean {
    return this.props.length > 0;
  }

  /** Adds an index signature to the object type. */
  idxSig(name: string, fn: (i: TypeIdxSigTsDsl) => void): this {
    const idx = new TypeIdxSigTsDsl(name, fn);
    this.props.push(idx);
    return this;
  }

  /** Returns true if object has no properties or spreads. */
  get isEmpty(): boolean {
    return !this.props.length;
  }

  /** Adds a property signature (returns property builder). */
  prop(name: string, fn: (p: TypePropTsDsl) => void): this {
    const prop = new TypePropTsDsl(name, fn);
    this.props.push(prop);
    return this;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  $render(): ts.TypeNode {
    return ts.factory.createTypeLiteralNode(this.$node(this.props));
  }
}
