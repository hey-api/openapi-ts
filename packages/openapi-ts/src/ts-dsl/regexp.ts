import ts from 'typescript';

import { TsDsl } from './base';

type RegexFlag = 'g' | 'i' | 'm' | 's' | 'u' | 'y';

type RegexFlags<Avail extends string = RegexFlag> =
  | ''
  | {
      [K in Avail]: `${K}${RegexFlags<Exclude<Avail, K>>}`;
    }[Avail];

export class RegExpTsDsl extends TsDsl<ts.RegularExpressionLiteral> {
  private pattern: string;
  private flags?: RegexFlags;

  constructor(pattern: string, flags?: RegexFlags) {
    super();
    this.pattern = pattern;
    this.flags = flags;
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
