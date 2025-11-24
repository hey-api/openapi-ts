import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeTsDsl } from '../base';
import { TypeIdxSigTsDsl } from './idx-sig';
import { TypePropTsDsl } from './prop';

const Mixed = TypeTsDsl<ts.TypeNode>;

export class TypeObjectTsDsl extends Mixed {
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

  override traverse(visitor: (node: SyntaxNode) => void): void {
    super.traverse(visitor);
  }

  protected override _render() {
    return ts.factory.createTypeLiteralNode(this.$node(this.props));
  }
}
