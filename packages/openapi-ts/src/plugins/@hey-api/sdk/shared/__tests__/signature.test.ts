import { describe, expect, it } from 'vitest';

import { getSignatureParameters } from '../signature';

const createOperation = (requestBodyRequired: boolean): any => ({
  body: {
    required: requestBodyRequired,
    schema: {
      properties: {
        bar: { type: 'string' },
        foo: { type: 'string' },
      },
      required: ['foo'],
      type: 'object',
    },
  },
});

describe('getSignatureParameters', () => {
  it('marks required body properties as required when request body is required', () => {
    const signature = getSignatureParameters({
      operation: createOperation(true),
      plugin: {} as any,
    });

    expect(signature?.parameters.foo?.isRequired).toBe(true);
    expect(signature?.parameters.bar?.isRequired).toBe(false);
  });

  it('keeps body properties optional when request body is optional', () => {
    const signature = getSignatureParameters({
      operation: createOperation(false),
      plugin: {} as any,
    });

    expect(signature?.parameters.foo?.isRequired).toBe(false);
    expect(signature?.parameters.bar?.isRequired).toBe(false);
  });
});
