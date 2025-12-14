import type { AnalysisContext, AstContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import { TypeTsDsl } from '../base';

const Mixed = TypeTsDsl<ts.TemplateLiteralTypeNode>;

export class TypeTemplateTsDsl extends Mixed {
  readonly '~dsl' = 'TypeTemplateTsDsl';

  protected parts: Array<string | MaybeTsDsl<ts.TypeNode>> = [];

  constructor(value?: string | MaybeTsDsl<ts.TypeNode>) {
    super();
    if (value !== undefined) this.add(value);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    for (const part of this.parts) {
      ctx.analyze(part);
    }
  }

  /** Adds a raw string segment or embedded type expression. */
  add(part: string | MaybeTsDsl<ts.TypeNode>): this {
    this.parts.push(part);
    return this;
  }

  override toAst(ctx: AstContext) {
    const parts = this.$node(ctx, this.parts);

    const normalized: Array<string | ts.TypeNode> = [];
    // merge consecutive string parts
    for (let index = 0; index < parts.length; index++) {
      const current = parts[index]!;
      if (typeof current === 'string') {
        let merged = current;
        while (
          index + 1 < parts.length &&
          typeof parts[index + 1] === 'string'
        ) {
          merged += parts[index + 1]!;
          index++;
        }
        normalized.push(merged);
      } else {
        normalized.push(current);
      }
    }

    if (normalized.length === 0 || typeof normalized[0] !== 'string') {
      normalized.unshift('');
    }

    if (normalized.length === 1 && typeof normalized[0] === 'string') {
      return ts.factory.createTemplateLiteralType(
        ts.factory.createTemplateHead(normalized[0]),
        [],
      );
    }

    if (
      normalized.length === 2 &&
      typeof normalized[0] === 'string' &&
      typeof normalized[1] !== 'string'
    ) {
      return ts.factory.createTemplateLiteralType(
        ts.factory.createTemplateHead(normalized[0]),
        [
          ts.factory.createTemplateLiteralTypeSpan(
            normalized[1]!,
            ts.factory.createTemplateTail(''),
          ),
        ],
      );
    }

    const head = ts.factory.createTemplateHead(normalized.shift() as string);
    const spans: Array<ts.TemplateLiteralTypeSpan> = [];

    while (normalized.length) {
      const type = normalized.shift() as ts.TypeNode;
      const next =
        typeof normalized[0] === 'string' ? (normalized.shift() as string) : '';
      const isLast = normalized.length === 0;
      spans.push(
        ts.factory.createTemplateLiteralTypeSpan(
          type,
          isLast
            ? ts.factory.createTemplateTail(next)
            : ts.factory.createTemplateMiddle(next),
        ),
      );
    }

    return ts.factory.createTemplateLiteralType(head, spans);
  }
}
