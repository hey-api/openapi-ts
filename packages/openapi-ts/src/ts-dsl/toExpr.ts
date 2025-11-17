import type ts from 'typescript';

import { ArrayTsDsl } from './array';
import { TsDsl } from './base';
import { LiteralTsDsl } from './literal';
import { ObjectTsDsl } from './object';

export const toExpr = (
  value: unknown,
  options?: {
    layout?: 'pretty';
  },
): TsDsl<ts.Expression> | undefined => {
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
    const arr = new ArrayTsDsl(...value.map((v) => toExpr(v, options) ?? v));
    if (options?.layout === 'pretty') arr.pretty();
    return arr;
  }

  if (typeof value === 'object') {
    const obj = new ObjectTsDsl();
    for (const [key, val] of Object.entries(value)) {
      const expr = toExpr(val, options);
      if (expr) obj.prop(key, expr);
    }
    if (options?.layout === 'pretty') obj.pretty();
    return obj;
  }

  return;
};
