import * as v from 'valibot';

import { setupValibotTest } from './test-helper';

// TODO: further clean up
describe('Number Type Formats Tests', () => {
  let generatedSchemas: any;

  beforeAll(async () => {
    generatedSchemas = await setupValibotTest('formats.yaml', 'formats');
  });

  // Format bounds and error messages from INTEGER_FORMATS
  const FORMAT_BOUNDS = {
    int16: {
      max: 32767,
      maxError: 'Invalid value: Expected int16 to be <= 32767',
      min: -32768,
      minError: 'Invalid value: Expected int16 to be >= -32768',
    },
    int32: {
      max: 2147483647,
      maxError: 'Invalid value: Expected int32 to be <= 2147483647',
      min: -2147483648,
      minError: 'Invalid value: Expected int32 to be >= -2147483648',
    },
    int64: {
      max: '9223372036854775807',
      maxError: 'Invalid value: Expected int64 to be <= 9223372036854775807',
      min: '-9223372036854775808',
      minError: 'Invalid value: Expected int64 to be >= -9223372036854775808',
    },
    int8: {
      max: 127,
      maxError: 'Invalid value: Expected int8 to be <= 127',
      min: -128,
      minError: 'Invalid value: Expected int8 to be >= -128',
    },
    uint16: {
      max: 65535,
      maxError: 'Invalid value: Expected uint16 to be <= 65535',
      min: 0,
      minError: 'Invalid value: Expected uint16 to be >= 0',
    },
    uint32: {
      max: 4294967295,
      maxError: 'Invalid value: Expected uint32 to be <= 4294967295',
      min: 0,
      minError: 'Invalid value: Expected uint32 to be >= 0',
    },
    uint64: {
      max: '18446744073709551615',
      maxError: 'Invalid value: Expected uint64 to be <= 18446744073709551615',
      min: '0',
      minError: 'Invalid value: Expected uint64 to be >= 0',
    },
    uint8: {
      max: 255,
      maxError: 'Invalid value: Expected uint8 to be <= 255',
      min: 0,
      minError: 'Invalid value: Expected uint8 to be >= 0',
    },
  };

  describe('Number Type Format Validation', () => {
    describe('numberNoFormat', () => {
      it('should validate any number value', () => {
        const result = v.safeParse(generatedSchemas.vNumberNoFormat, 123.456);
        expect(result.success).toBe(true);
      });
    });

    describe('numberInt8', () => {
      it('should validate values within int8 range', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt8, 100);
        expect(result.success).toBe(true);
      });

      it('should reject values below int8 minimum', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt8, -129);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int8.minError);
      });

      it('should reject values above int8 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt8, 128);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int8.maxError);
      });
    });

    describe('numberInt16', () => {
      it('should validate values within int16 range', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt16, 30000);
        expect(result.success).toBe(true);
      });

      it('should reject values below int16 minimum', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt16, -32769);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int16.minError);
      });

      it('should reject values above int16 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt16, 32768);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int16.maxError);
      });
    });

    describe('numberInt32', () => {
      it('should validate values within int32 range', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt32, 2000000000);
        expect(result.success).toBe(true);
      });

      it('should reject values below int32 minimum', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt32, -2147483649);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int32.minError);
      });

      it('should reject values above int32 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt32, 2147483648);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int32.maxError);
      });
    });

    describe('numberInt64', () => {
      it('should validate values within int64 range and convert to BigInt', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt64, 1000000000000);
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should validate string values within int64 range', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt64, '1000000000000');
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should reject values above int64 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberInt64, '9223372036854775808');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int64.maxError);
      });
    });

    describe('numberUint8', () => {
      it('should validate values within uint8 range', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint8, 200);
        expect(result.success).toBe(true);
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint8, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint8.minError);
      });

      it('should reject values above uint8 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint8, 256);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint8.maxError);
      });
    });

    describe('numberUint16', () => {
      it('should validate values within uint16 range', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint16, 60000);
        expect(result.success).toBe(true);
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint16, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint16.minError);
      });

      it('should reject values above uint16 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint16, 65536);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint16.maxError);
      });
    });

    describe('numberUint32', () => {
      it('should validate values within uint32 range', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint32, 4000000000);
        expect(result.success).toBe(true);
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint32, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint32.minError);
      });

      it('should reject values above uint32 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint32, 4294967296);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint32.maxError);
      });
    });

    describe('numberUint64', () => {
      it('should validate values within uint64 range and convert to BigInt', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint64, 1000000000000);
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint64, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint64.minError);
      });

      it('should reject values above uint64 maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberUint64, '18446744073709551616');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint64.maxError);
      });
    });
  });

  describe('Integer Type Format Validation', () => {
    describe('integerNoFormat', () => {
      it('should validate any integer value', () => {
        const result = v.safeParse(generatedSchemas.vIntegerNoFormat, 123);
        expect(result.success).toBe(true);
      });

      it('should reject non-integer values', () => {
        const result = v.safeParse(generatedSchemas.vIntegerNoFormat, 123.456);
        expect(result.success).toBe(false);
      });
    });

    describe('integerInt8', () => {
      it('should validate values within int8 range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt8, 100);
        expect(result.success).toBe(true);
      });

      it('should reject values below int8 minimum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt8, -129);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int8.minError);
      });

      it('should reject values above int8 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt8, 128);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int8.maxError);
      });
    });

    describe('integerInt16', () => {
      it('should validate values within int16 range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt16, 30000);
        expect(result.success).toBe(true);
      });

      it('should reject values below int16 minimum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt16, -32769);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int16.minError);
      });

      it('should reject values above int16 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt16, 32768);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int16.maxError);
      });
    });

    describe('integerInt32', () => {
      it('should validate values within int32 range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt32, 2000000000);
        expect(result.success).toBe(true);
      });

      it('should reject values below int32 minimum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt32, -2147483649);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int32.minError);
      });

      it('should reject values above int32 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt32, 2147483648);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int32.maxError);
      });
    });

    describe('integerInt64', () => {
      it('should validate values within int64 range and convert to BigInt', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt64, 1000000000000);
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should validate string values within int64 range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt64, '1000000000000');
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should reject values above int64 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerInt64, '9223372036854775808');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int64.maxError);
      });
    });

    describe('integerUint8', () => {
      it('should validate values within uint8 range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint8, 200);
        expect(result.success).toBe(true);
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint8, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint8.minError);
      });

      it('should reject values above uint8 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint8, 256);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint8.maxError);
      });
    });

    describe('integerUint16', () => {
      it('should validate values within uint16 range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint16, 60000);
        expect(result.success).toBe(true);
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint16, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint16.minError);
      });

      it('should reject values above uint16 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint16, 65536);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint16.maxError);
      });
    });

    describe('integerUint32', () => {
      it('should validate values within uint32 range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint32, 4000000000);
        expect(result.success).toBe(true);
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint32, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint32.minError);
      });

      it('should reject values above uint32 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint32, 4294967296);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint32.maxError);
      });
    });

    describe('integerUint64', () => {
      it('should validate values within uint64 range and convert to BigInt', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint64, 1000000000000);
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint64, -1);
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint64.minError);
      });

      it('should reject values above uint64 maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerUint64, '18446744073709551616');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint64.maxError);
      });
    });
  });

  describe('String Type Format Validation', () => {
    describe('stringInt64', () => {
      it('should validate string values within int64 range and convert to BigInt', () => {
        const result = v.safeParse(generatedSchemas.vStringInt64, '1000000000000');
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should reject values below int64 minimum', () => {
        const result = v.safeParse(generatedSchemas.vStringInt64, '-9223372036854775809');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int64.minError);
      });

      it('should reject values above int64 maximum', () => {
        const result = v.safeParse(generatedSchemas.vStringInt64, '9223372036854775808');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.int64.maxError);
      });
    });

    describe('stringUint64', () => {
      it('should validate string values within uint64 range and convert to BigInt', () => {
        const result = v.safeParse(generatedSchemas.vStringUint64, '1000000000000');
        expect(result.success).toBe(true);
        expect(typeof result.output).toBe('bigint');
      });

      it('should reject negative values', () => {
        const result = v.safeParse(generatedSchemas.vStringUint64, '-1');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint64.minError);
      });

      it('should reject values above uint64 maximum', () => {
        const result = v.safeParse(generatedSchemas.vStringUint64, '18446744073709551616');
        expect(result.success).toBe(false);
        expect(result.issues![0].message).toContain(FORMAT_BOUNDS.uint64.maxError);
      });
    });
  });
});
