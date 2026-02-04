import * as v from 'valibot';

import { setupValibotTest } from './test-helper';

// TODO: further clean up
describe('Number Type Const Values Tests', () => {
  let generatedSchemas: any;

  beforeAll(async () => {
    generatedSchemas = await setupValibotTest('const-values.yaml', 'const-values');
  });

  describe('Number Type Const Validation', () => {
    it('should accept exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberNoFormat, 42.5);
      expect(result.success).toBe(true);
    });

    it('should reject non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberNoFormat, 42.6);
      expect(result.success).toBe(false);
    });
  });

  describe('Number Type Format Const Validation', () => {
    it('should accept NumberInt8 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt8, 100);
      expect(result.success).toBe(true);
    });

    it('should reject NumberInt8 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt8, 101);
      expect(result.success).toBe(false);
    });

    it('should accept NumberInt16 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt16, 1000);
      expect(result.success).toBe(true);
    });

    it('should reject NumberInt16 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt16, 1001);
      expect(result.success).toBe(false);
    });

    it('should accept NumberInt32 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt32, 100000);
      expect(result.success).toBe(true);
    });

    it('should reject NumberInt32 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt32, 100001);
      expect(result.success).toBe(false);
    });

    it('should accept NumberInt64 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt64, BigInt('1000000000000'));
      expect(result.success).toBe(true);
    });

    it('should reject NumberInt64 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberInt64, BigInt('1000000000001'));
      expect(result.success).toBe(false);
    });

    it('should accept NumberUint8 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint8, 200);
      expect(result.success).toBe(true);
    });

    it('should reject NumberUint8 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint8, 201);
      expect(result.success).toBe(false);
    });

    it('should accept NumberUint16 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint16, 50000);
      expect(result.success).toBe(true);
    });

    it('should reject NumberUint16 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint16, 50001);
      expect(result.success).toBe(false);
    });

    it('should accept NumberUint32 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint32, 3000000000);
      expect(result.success).toBe(true);
    });

    it('should reject NumberUint32 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint32, 3000000001);
      expect(result.success).toBe(false);
    });

    it('should accept NumberUint64 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint64, BigInt('18000000000000000000'));
      expect(result.success).toBe(true);
    });

    it('should reject NumberUint64 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vNumberUint64, BigInt('18000000000000000001'));
      expect(result.success).toBe(false);
    });
  });

  describe('Integer Type Const Validation', () => {
    it('should accept exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerNoFormat, -1);
      expect(result.success).toBe(true);
    });

    it('should reject non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerNoFormat, 0);
      expect(result.success).toBe(false);
    });
  });

  describe('Integer Type Format Const Validation', () => {
    it('should accept IntegerInt8 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt8, -100);
      expect(result.success).toBe(true);
    });

    it('should reject IntegerInt8 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt8, -99);
      expect(result.success).toBe(false);
    });

    it('should accept IntegerInt16 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt16, -1000);
      expect(result.success).toBe(true);
    });

    it('should reject IntegerInt16 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt16, -999);
      expect(result.success).toBe(false);
    });

    it('should accept IntegerInt32 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt32, -100000);
      expect(result.success).toBe(true);
    });

    it('should reject IntegerInt32 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt32, -99999);
      expect(result.success).toBe(false);
    });

    it('should accept IntegerInt64 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt64, BigInt('-1000000000000'));
      expect(result.success).toBe(true);
    });

    it('should reject IntegerInt64 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerInt64, BigInt('-999999999999'));
      expect(result.success).toBe(false);
    });

    it('should accept IntegerUint8 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint8, 255);
      expect(result.success).toBe(true);
    });

    it('should reject IntegerUint8 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint8, 254);
      expect(result.success).toBe(false);
    });

    it('should accept IntegerUint16 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint16, 65535);
      expect(result.success).toBe(true);
    });

    it('should reject IntegerUint16 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint16, 65534);
      expect(result.success).toBe(false);
    });

    it('should accept IntegerUint32 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint32, 4294967295);
      expect(result.success).toBe(true);
    });

    it('should reject IntegerUint32 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint32, 4294967294);
      expect(result.success).toBe(false);
    });

    it('should accept IntegerUint64 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint64, BigInt('1000000000000'));
      expect(result.success).toBe(true);
    });

    it('should reject IntegerUint64 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vIntegerUint64, BigInt('1000000000001'));
      expect(result.success).toBe(false);
    });
  });

  describe('String Type Format Const Validation', () => {
    it('should accept StringInt64 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vStringInt64, BigInt('-9223372036854775808'));
      expect(result.success).toBe(true);
    });

    it('should reject StringInt64 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vStringInt64, BigInt('-9223372036854775807'));
      expect(result.success).toBe(false);
    });

    it('should accept StringUint64 exact const value', () => {
      const result = v.safeParse(generatedSchemas.vStringUint64, BigInt('18446744073709551615'));
      expect(result.success).toBe(true);
    });

    it('should reject StringUint64 non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vStringUint64, BigInt('18446744073709551614'));
      expect(result.success).toBe(false);
    });
  });

  describe('String Type Format Const Validation (BigInt Literal)', () => {
    it('should accept StringInt64n exact const value', () => {
      const result = v.safeParse(generatedSchemas.vStringInt64n, BigInt('-9223372036854775808'));
      expect(result.success).toBe(true);
    });

    it('should reject StringInt64n non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vStringInt64n, BigInt('-9223372036854775807'));
      expect(result.success).toBe(false);
    });

    it('should accept StringUint64n exact const value', () => {
      const result = v.safeParse(generatedSchemas.vStringUint64n, BigInt('18446744073709551615'));
      expect(result.success).toBe(true);
    });

    it('should reject StringUint64n non-matching values', () => {
      const result = v.safeParse(generatedSchemas.vStringUint64n, BigInt('18446744073709551614'));
      expect(result.success).toBe(false);
    });
  });
});
