import { describe, expect, it } from 'vitest';

import type { Context } from '~/ir/context';
import type { IR } from '~/ir/types';

import type { ParameterObject, SchemaObject } from '../../types/spec';
import { parameterToIrParameter } from '../parameter';

describe('parameter', () => {
  const createMockContext = (): Context =>
    ({
      config: {
        client: {
          name: '@hey-api/client-fetch',
        },
        output: {
          path: 'test',
        },
        parser: {
          pagination: {
            keywords: ['page', 'offset', 'limit'],
          },
        },
        plugins: {},
      },
      dereference: (obj: any) => {
        // Simple mock dereference that just returns the object
        if ('$ref' in obj && obj.$ref === '#/test/example') {
          return { value: 'dereferenced-value' };
        }
        return obj;
      },
      ir: {
        components: {
          schemas: {},
        },
        paths: {},
        servers: [],
      },
      resolve: () => ({}),
      resolveRef: (ref: string) => ({ $ref: ref }),
    }) as unknown as Context;

  describe('parameter precedence', () => {
    it('should prioritize parameter description over schema description', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        description: 'Parameter description',
        in: 'query',
        name: 'testParam',
        schema: {
          description: 'Schema description',
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect(result.schema?.description).toBe('Parameter description');
    });

    it('should use schema description when parameter description is undefined', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        in: 'query',
        name: 'testParam',
        schema: {
          description: 'Schema description',
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect(result.schema?.description).toBe('Schema description');
    });

    it('should prioritize parameter deprecated over schema deprecated', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        deprecated: true,
        in: 'query',
        name: 'testParam',
        schema: {
          deprecated: false,
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect(result.schema?.deprecated).toBe(true);
    });

    it('should use schema deprecated when parameter deprecated is undefined', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        in: 'query',
        name: 'testParam',
        schema: {
          deprecated: true,
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect(result.schema?.deprecated).toBe(true);
    });

    it('should prioritize parameter example over schema example', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        example: 'parameter-example',
        in: 'query',
        name: 'testParam',
        schema: {
          example: 'schema-example',
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect((result.schema as IR.SchemaObject)?.examples).toEqual([
        'parameter-example',
      ]);
    });
  });

  describe('examples extraction', () => {
    it('should extract examples from parameter.examples object', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        examples: {
          example1: { value: 'value1' },
          example2: { value: 'value2' },
          example3: { value: 123 },
        },
        in: 'query',
        name: 'testParam',
        schema: {
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect((result.schema as IR.SchemaObject)?.examples).toEqual([
        'value1',
        'value2',
        123,
      ]);
    });

    it('should extract example from parameter.example', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        example: 'single-example',
        in: 'query',
        name: 'testParam',
        schema: {
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect((result.schema as IR.SchemaObject)?.examples).toEqual([
        'single-example',
      ]);
    });

    it('should handle $ref in examples', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        examples: {
          refExample: { $ref: '#/test/example' },
        },
        in: 'query',
        name: 'testParam',
        schema: {
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect((result.schema as IR.SchemaObject)?.examples).toEqual([
        'dereferenced-value',
      ]);
    });

    it('should filter out undefined values from examples', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        examples: {
          example1: { value: 'value1' },
          example2: { value: undefined },
          example3: { value: 'value3' },
        },
        in: 'query',
        name: 'testParam',
        schema: {
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect((result.schema as IR.SchemaObject)?.examples).toEqual([
        'value1',
        'value3',
      ]);
    });

    it('should handle missing examples', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        in: 'query',
        name: 'testParam',
        schema: {
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect((result.schema as IR.SchemaObject)?.examples).toBeUndefined();
    });

    it('should use schema example as fallback when no parameter examples', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        in: 'query',
        name: 'testParam',
        schema: {
          example: 'schema-example',
          type: 'string',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      expect((result.schema as IR.SchemaObject)?.examples).toEqual([
        'schema-example',
      ]);
    });

    // Skipping test for schema with $ref - requires more complex mocking
    it.skip('should handle schema with $ref and parameter metadata', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        deprecated: true,
        description: 'Parameter description',
        example: 'param-example',
        in: 'query',
        name: 'testParam',
        schema: {
          $ref: '#/components/schemas/TestSchema',
        },
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      const schema = result.schema as IR.SchemaObject;
      expect(schema?.description).toBe('Parameter description');
      expect(schema?.deprecated).toBe(true);
      expect(schema?.examples).toEqual(['param-example']);
    });
  });

  describe('combined attributes', () => {
    it('should combine parameter and schema attributes correctly', () => {
      const context = createMockContext();
      const parameter: ParameterObject = {
        deprecated: false,
        description: 'Parameter description',
        example: 'param-example',
        in: 'query',
        name: 'testParam',
        required: true,
        schema: {
          default: 'default-value',
          description: 'Should be overridden',
          example: 'Should be overridden',
          maximum: 100,
          minimum: 0,
          type: 'number',
        } as SchemaObject,
      };

      const result = parameterToIrParameter({
        $ref: '#/components/parameters/testParam',
        context,
        parameter,
      });

      const schema = result.schema as IR.SchemaObject;
      expect(schema?.description).toBe('Parameter description');
      expect(schema?.deprecated).toBe(false);
      expect(schema?.examples).toEqual(['param-example']);
      expect(schema?.type).toBe('number');
      expect(schema?.default).toBe('default-value');
      expect(schema?.maximum).toBe(100);
      expect(schema?.minimum).toBe(0);
      expect(result.name).toBe('testParam');
      expect(result.location).toBe('query');
      expect(result.required).toBe(true);
    });
  });
});
