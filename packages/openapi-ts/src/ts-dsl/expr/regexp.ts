import type { SyntaxNode } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TsDsl } from '../base';

type RegexFlag = 'g' | 'i' | 'm' | 's' | 'u' | 'y';

type RegexFlags<Avail extends string = RegexFlag> =
  | ''
  | {
      [K in Avail]: `${K}${RegexFlags<Exclude<Avail, K>>}`;
    }[Avail];

export class RegExpTsDsl extends TsDsl<ts.RegularExpressionLiteral> {
  protected pattern: string;
  protected flags?: RegexFlags;

  constructor(pattern: string, flags?: RegexFlags) {
    super();
    this.pattern = pattern;
    this.flags = flags;
  }

  /** Walk this node and its children with a visitor. */
  traverse(visitor: (node: SyntaxNode) => void): void {
    console.log(visitor);
  }

  /** Emits a RegularExpressionLiteral node. */
  $render(): ts.RegularExpressionLiteral {
    const patternContent =
      this.pattern.startsWith('/') && this.pattern.endsWith('/')
        ? this.pattern.slice(1, -1)
        : this.pattern;
    const escapedPattern = patternContent.replace(/(?<!\\)\//g, '\\/');
    const literal = `/${escapedPattern}/${this.flags ?? ''}`;
    return ts.factory.createRegularExpressionLiteral(literal);
  }
}
