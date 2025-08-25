import { describe, expect, it } from 'vitest';

import { deduplicateSchema } from '../schema';
import type { IR } from '../types';

describe('deduplicateSchema', () => {
  const scenarios: ReadonlyArray<{
    description: string;
    detectFormat?: boolean;
    result: IR.SchemaObject;
    schema: IR.SchemaObject;
  }> = [
    {
      description: 'keeps multiple strings if they have different formats',
      result: {
        items: [
          {
            format: 'uuid',
            type: 'string',
          },
          {
            type: 'string',
          },
        ],
        logicalOperator: 'or',
      },
      schema: {
        items: [
          {
            format: 'uuid',
            type: 'string',
          },
          {
            type: 'string',
          },
        ],
        logicalOperator: 'or',
      },
    },
    {
      description:
        'discards duplicate strings if they have different formats and `detectFormat` is `false`',
      detectFormat: false,
      result: {
        format: 'uuid',
        type: 'string',
      },
      schema: {
        items: [
          {
            format: 'uuid',
            type: 'string',
          },
          {
            type: 'string',
          },
        ],
        logicalOperator: 'or',
      },
    },
  ];

  it.each(scenarios)('$description', ({ detectFormat, result, schema }) => {
    expect(deduplicateSchema({ detectFormat, schema })).toEqual(result);
  });
});
