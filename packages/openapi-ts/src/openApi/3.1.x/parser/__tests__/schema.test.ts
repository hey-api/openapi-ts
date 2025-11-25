import { describe, expect, it } from 'vitest';

import type { Context } from '~/ir/context';

import type { SchemaObject } from '../../types/spec';
import { schemaToIrSchema } from '../schema';

describe('schema', () => {
  const createMockContext = (): Context =>
    ({
      config: {
        client: {
          name: '@hey-api/client-fetch',
        },
        output: {
          path: 'test',
        },
        plugins: {},
      },
      ir: {
        components: {
          schemas: {},
        },
        paths: {},
        servers: [],
      },
      resolve: () => ({}),
    }) as unknown as Context;

  describe('examples handling', () => {
    it('should parse examples array from schema', () => {
      const context = createMockContext();
      const schema: SchemaObject = {
        examples: ['example1', 'example2', 123, true],
        type: 'string',
      };

      const result = schemaToIrSchema({
        context,
        schema,
        state: {
          $ref: '#/components/schemas/Test',
          circularReferenceTracker: new Set(),
        },
      });

      expect(result.examples).toEqual(['example1', 'example2', 123, true]);
    });

    it('should parse single example from schema', () => {
      const context = createMockContext();
      const schema: SchemaObject = {
        example: 'single-example',
        type: 'string',
      };

      const result = schemaToIrSchema({
        context,
        schema,
        state: {
          $ref: '#/components/schemas/Test',
          circularReferenceTracker: new Set(),
        },
      });

      expect(result.example).toBe('single-example');
    });

    it('should handle both example and examples', () => {
      const context = createMockContext();
      const schema: SchemaObject = {
        example: 'single-example',
        examples: ['example1', 'example2'],
        type: 'string',
      };

      const result = schemaToIrSchema({
        context,
        schema,
        state: {
          $ref: '#/components/schemas/Test',
          circularReferenceTracker: new Set(),
        },
      });

      expect(result.example).toBe('single-example');
      expect(result.examples).toEqual(['example1', 'example2']);
    });

    it('should handle missing examples', () => {
      const context = createMockContext();
      const schema: SchemaObject = {
        type: 'string',
      };

      const result = schemaToIrSchema({
        context,
        schema,
        state: {
          $ref: '#/components/schemas/Test',
          circularReferenceTracker: new Set(),
        },
      });

      expect(result.example).toBeUndefined();
      expect(result.examples).toBeUndefined();
    });

    it('should handle examples with different types', () => {
      const context = createMockContext();
      const schema: SchemaObject = {
        examples: ['string', 42, true, null, { nested: 'object' }],
        type: 'string',
      };

      const result = schemaToIrSchema({
        context,
        schema,
        state: {
          $ref: '#/components/schemas/Test',
          circularReferenceTracker: new Set(),
        },
      });

      expect(result.examples).toEqual([
        'string',
        42,
        true,
        null,
        { nested: 'object' },
      ]);
    });
  });
});
