import * as v from 'valibot';
import { beforeAll, describe, expect, it } from 'vitest';

import { setupValibotTest } from '../../test-helper';

describe('Object Additional Properties Tests', () => {
  let generatedSchemas: any;

  beforeAll(async () => {
    generatedSchemas = await setupValibotTest();
  });

  describe('ObjectWithAdditionalPropertiesString', () => {
    it('should preserve string additional properties in nested headers object', () => {
      const input = {
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithAdditionalPropertiesString,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.headers).toEqual({
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        });
      }
    });

    it('should reject non-string values in additional properties', () => {
      const input = {
        headers: {
          Authorization: 'Bearer token',
          Count: 123, // Invalid: should be string
        },
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithAdditionalPropertiesString,
        input,
      );
      expect(result.success).toBe(false);
    });

    it('should accept empty headers object', () => {
      const input = {
        headers: {},
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithAdditionalPropertiesString,
        input,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('ObjectOnlyAdditionalPropertiesString', () => {
    it('should preserve string additional properties', () => {
      const input = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };
      const result = v.safeParse(
        generatedSchemas.vObjectOnlyAdditionalPropertiesString,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual(input);
      }
    });

    it('should reject non-string values', () => {
      const input = {
        key1: 'value1',
        key2: 123, // Invalid: should be string
      };
      const result = v.safeParse(
        generatedSchemas.vObjectOnlyAdditionalPropertiesString,
        input,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('ObjectOnlyAdditionalPropertiesNumber', () => {
    it('should preserve number additional properties', () => {
      const input = {
        score1: 100,
        score2: 95.5,
        score3: 0,
      };
      const result = v.safeParse(
        generatedSchemas.vObjectOnlyAdditionalPropertiesNumber,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual(input);
      }
    });

    it('should reject non-number values', () => {
      const input = {
        score1: 100,
        score2: 'invalid', // Invalid: should be number
      };
      const result = v.safeParse(
        generatedSchemas.vObjectOnlyAdditionalPropertiesNumber,
        input,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('ObjectOnlyAdditionalPropertiesBoolean', () => {
    it('should preserve boolean additional properties', () => {
      const input = {
        flag1: true,
        flag2: false,
        flag3: true,
      };
      const result = v.safeParse(
        generatedSchemas.vObjectOnlyAdditionalPropertiesBoolean,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual(input);
      }
    });

    it('should reject non-boolean values', () => {
      const input = {
        flag1: true,
        flag2: 'true', // Invalid: should be boolean
      };
      const result = v.safeParse(
        generatedSchemas.vObjectOnlyAdditionalPropertiesBoolean,
        input,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('ObjectWithPropertiesAndAdditionalPropertiesNumber', () => {
    it('should preserve both named properties and additional properties', () => {
      const input = {
        count: 42,
        extra1: 1.5,
        extra2: 2.5,
        id: 'abc123',
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithPropertiesAndAdditionalPropertiesNumber,
        input,
      );
      if (!result.success) {
        console.log('Validation failed:', result.issues);
      }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual(input);
      }
    });

    it('should validate types of both named and additional properties', () => {
      const input = {
        count: 42,
        extra1: 'invalid',
        id: 'abc123', // Invalid: should be number
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithPropertiesAndAdditionalPropertiesNumber,
        input,
      );
      expect(result.success).toBe(false);
    });

    it('should require named properties but allow empty additional properties', () => {
      const input = {
        count: 42,
        id: 'abc123',
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithPropertiesAndAdditionalPropertiesNumber,
        input,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('ObjectWithAdditionalPropertiesObject', () => {
    it('should preserve nested object additional properties', () => {
      const input = {
        metadata: {
          field1: { value: 'test1' },
          field2: { value: 'test2' },
        },
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithAdditionalPropertiesObject,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.metadata).toEqual({
          field1: { value: 'test1' },
          field2: { value: 'test2' },
        });
      }
    });

    it('should validate nested object structure', () => {
      const input = {
        metadata: {
          field1: { value: 'test1' },
          field2: { invalidKey: 'test2' }, // Object without required structure
        },
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithAdditionalPropertiesObject,
        input,
      );
      // Should succeed as the nested object properties are optional
      expect(result.success).toBe(true);
    });
  });

  describe('ObjectOnlyAdditionalPropertiesObject', () => {
    it('should preserve object additional properties', () => {
      const input = {
        item1: { name: 'Item 1' },
        item2: { name: 'Item 2' },
      };
      const result = v.safeParse(
        generatedSchemas.vObjectOnlyAdditionalPropertiesObject,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual(input);
      }
    });
  });

  describe('ObjectWithAdditionalPropertiesFalse', () => {
    it('should accept object with only defined properties', () => {
      const input = {
        count: 42,
        id: 'abc123',
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithAdditionalPropertiesFalse,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual(input);
      }
    });

    it('should reject object with additional properties', () => {
      const input = {
        count: 42,
        extra: 'not allowed',
        id: 'abc123',
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithAdditionalPropertiesFalse,
        input,
      );
      expect(result.success).toBe(false);
    });
  });

  describe('ObjectWithNestedAdditionalPropertiesFalse', () => {
    it('should accept object with correct nested properties', () => {
      const input = {
        membership: {
          calendar_membership_tier_id: 'tier_id',
          status: 'approved',
        },
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithNestedAdditionalPropertiesFalse,
        input,
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual(input);
      }
    });

    it('should reject object with additional properties in nested object', () => {
      const input = {
        membership: {
          calendar_membership_tier_id: 'tier_id',
          extra: 'not allowed',
          status: 'approved',
        },
      };
      const result = v.safeParse(
        generatedSchemas.vObjectWithNestedAdditionalPropertiesFalse,
        input,
      );
      expect(result.success).toBe(false);
    });
  });
});
