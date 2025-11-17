import type ts from 'typescript';

import { ArrayTsDsl } from './array';
import { TsDsl } from './base';
import { LiteralTsDsl } from './literal';
import { ObjectTsDsl } from './object';

export const toExpr = (value: unknown): TsDsl<ts.Expression> | undefined => {
  if (value instanceof TsDsl) {
    return value;
  }

  if (value === null) {
    return new LiteralTsDsl(value);
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return new LiteralTsDsl(value);
  }

  if (value instanceof Array) {
    return new ArrayTsDsl(...value.map((v) => toExpr(v) ?? v));
  }

  if (typeof value === 'object') {
    const obj = new ObjectTsDsl();
    for (const [key, val] of Object.entries(value)) {
      const expr = toExpr(val);
      if (expr) obj.prop(key, expr);
    }
    return obj;
  }

  return;
};
