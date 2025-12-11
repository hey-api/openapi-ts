import { isNode } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { TsDsl } from '../base';
import { ArrayTsDsl } from './array';
import { LiteralTsDsl } from './literal';
import { ObjectTsDsl } from './object';

export const fromValue = (
  input: unknown,
  options?: {
    layout?: 'pretty';
  },
): TsDsl<ts.Expression> => {
  if (isNode(input)) {
    return input as TsDsl<ts.Expression>;
  }

  if (input === null) {
    return new LiteralTsDsl(input);
  }

  if (
    typeof input === 'number' ||
    typeof input === 'boolean' ||
    typeof input === 'string'
  ) {
    return new LiteralTsDsl(input);
  }

  if (input instanceof Array) {
    const arr = new ArrayTsDsl(...input.map((v) => fromValue(v, options)));
    if (options?.layout === 'pretty') arr.pretty();
    return arr;
  }

  if (typeof input === 'object') {
    const obj = new ObjectTsDsl();
    for (const [key, val] of Object.entries(input)) {
      const expr = fromValue(val, options);
      obj.prop(key, expr);
    }
    if (options?.layout === 'pretty') obj.pretty();
    return obj;
  }

  throw new Error(`$.fromValue(): Unsupported input type ${String(input)}`);
};
