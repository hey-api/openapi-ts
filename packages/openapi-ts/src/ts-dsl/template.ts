import ts from 'typescript';

import type { MaybeTsDsl, WithString } from './base';
import { TsDsl } from './base';

export class TemplateTsDsl extends TsDsl<
  ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral
> {
  private parts: Array<MaybeTsDsl<WithString>> = [];

  constructor(value?: MaybeTsDsl<WithString>) {
    super();
    if (value !== undefined) this.add(value);
  }

  add(value: MaybeTsDsl<WithString>): this {
    this.parts.push(value);
    return this;
  }

  $render(): ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral {
    const parts = this.$node(this.parts);

    const normalized: Array<WithString> = [];
    // merge consecutive string parts
    for (let index = 0; index < parts.length; index++) {
      const current = parts[index]!;
      if (typeof current === 'string') {
        let merged = current;
        while (
          index + 1 < parts.length &&
          typeof parts[index + 1] === 'string'
        ) {
          merged += parts[index + 1];
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
      return ts.factory.createNoSubstitutionTemplateLiteral(normalized[0]);
    }

    if (
      normalized.length === 2 &&
      typeof normalized[0] === 'string' &&
      typeof normalized[1] !== 'string'
    ) {
      return ts.factory.createTemplateExpression(
        ts.factory.createTemplateHead(normalized[0]),
        [
          ts.factory.createTemplateSpan(
            normalized[1]!,
            ts.factory.createTemplateTail(''),
          ),
        ],
      );
    }

    const head = ts.factory.createTemplateHead(normalized.shift() as string);
    const spans: Array<ts.TemplateSpan> = [];

    while (normalized.length) {
      const expr = normalized.shift() as ts.Expression;
      const next =
        typeof normalized[0] === 'string' ? (normalized.shift() as string) : '';
      const isLast = normalized.length === 0;
      spans.push(
        ts.factory.createTemplateSpan(
          expr,
          isLast
            ? ts.factory.createTemplateTail(next)
            : ts.factory.createTemplateMiddle(next),
        ),
      );
    }

    return ts.factory.createTemplateExpression(head, spans);
  }
}
