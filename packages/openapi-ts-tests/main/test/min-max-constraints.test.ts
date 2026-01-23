import * as v from 'valibot';

import { setupValibotTest } from './test-helper';

// TODO: further clean up
describe('Number Type Min/Max Constraints Tests', () => {
  let generatedSchemas: any;

  beforeAll(async () => {
    generatedSchemas = await setupValibotTest(
      'min-max-constraints.yaml',
      'min-max-constraints',
    );
  });

  describe('Basic Number Constraints', () => {
    describe('NumberWithMinimum', () => {
      it('should accept values at minimum boundary', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinimum, 10);
        expect(result.success).toBe(true);
      });

      it('should accept values above minimum', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinimum, 15);
        expect(result.success).toBe(true);
      });

      it('should reject values below minimum', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinimum, 9);
        expect(result.success).toBe(false);
      });
    });

    describe('NumberWithMaximum', () => {
      it('should accept values at maximum boundary', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMaximum, 100);
        expect(result.success).toBe(true);
      });

      it('should accept values below maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMaximum, 50);
        expect(result.success).toBe(true);
      });

      it('should reject values above maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMaximum, 101);
        expect(result.success).toBe(false);
      });
    });

    describe('NumberWithMinMax', () => {
      it('should accept values within range', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinMax, 50);
        expect(result.success).toBe(true);
      });

      it('should accept values at minimum boundary', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinMax, 0);
        expect(result.success).toBe(true);
      });

      it('should accept values at maximum boundary', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinMax, 100);
        expect(result.success).toBe(true);
      });

      it('should reject values below minimum', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinMax, -1);
        expect(result.success).toBe(false);
      });

      it('should reject values above maximum', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithMinMax, 101);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Basic Integer Constraints', () => {
    describe('IntegerWithMinimum', () => {
      it('should accept values at minimum boundary', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinimum, 5);
        expect(result.success).toBe(true);
      });

      it('should accept values above minimum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinimum, 10);
        expect(result.success).toBe(true);
      });

      it('should reject values below minimum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinimum, 4);
        expect(result.success).toBe(false);
      });
    });

    describe('IntegerWithMaximum', () => {
      it('should accept values at maximum boundary', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMaximum, 999);
        expect(result.success).toBe(true);
      });

      it('should accept values below maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMaximum, 500);
        expect(result.success).toBe(true);
      });

      it('should reject values above maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMaximum, 1000);
        expect(result.success).toBe(false);
      });
    });

    describe('IntegerWithMinMax', () => {
      it('should accept values within range', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinMax, 500);
        expect(result.success).toBe(true);
      });

      it('should accept values at minimum boundary', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinMax, 1);
        expect(result.success).toBe(true);
      });

      it('should accept values at maximum boundary', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinMax, 999);
        expect(result.success).toBe(true);
      });

      it('should reject values below minimum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinMax, 0);
        expect(result.success).toBe(false);
      });

      it('should reject values above maximum', () => {
        const result = v.safeParse(generatedSchemas.vIntegerWithMinMax, 1000);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Exclusive Constraints', () => {
    describe('NumberWithExclusiveMin', () => {
      it('should accept values above exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMin,
          0.1,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(generatedSchemas.vNumberWithExclusiveMin, 0);
        expect(result.success).toBe(false);
      });

      it('should reject values below exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMin,
          -1,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('NumberWithExclusiveMax', () => {
      it('should accept values below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMax,
          99.9,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMax,
          100,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values above exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMax,
          101,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('NumberWithExclusiveMinMax', () => {
      it('should accept values within exclusive range', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMinMax,
          0.5,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMinMax,
          0,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMinMax,
          1,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('IntegerWithExclusiveMin', () => {
      it('should accept values above exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMin,
          11,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMin,
          10,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values below exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMin,
          9,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('IntegerWithExclusiveMax', () => {
      it('should accept values below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMax,
          49,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMax,
          50,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values above exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMax,
          51,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('IntegerWithExclusiveMinMax', () => {
      it('should accept values within exclusive range', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMinMax,
          10,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMinMax,
          5,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMinMax,
          15,
        );
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Mixed Constraints', () => {
    describe('NumberWithExclusiveMinInclusiveMax', () => {
      it('should accept values above exclusive minimum and at inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMinInclusiveMax,
          90,
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above exclusive minimum and below inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMinInclusiveMax,
          50,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMinInclusiveMax,
          10,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values above inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithExclusiveMinInclusiveMax,
          91,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('NumberWithInclusiveMinExclusiveMax', () => {
      it('should accept values at inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithInclusiveMinExclusiveMax,
          20,
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithInclusiveMinExclusiveMax,
          50,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values below inclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithInclusiveMinExclusiveMax,
          19,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vNumberWithInclusiveMinExclusiveMax,
          80,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('IntegerWithExclusiveMinInclusiveMax', () => {
      it('should accept values above exclusive minimum and at inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMinInclusiveMax,
          50,
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above exclusive minimum and below inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMinInclusiveMax,
          25,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMinInclusiveMax,
          5,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values above inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithExclusiveMinInclusiveMax,
          51,
        );
        expect(result.success).toBe(false);
      });
    });

    describe('IntegerWithInclusiveMinExclusiveMax', () => {
      it('should accept values at inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithInclusiveMinExclusiveMax,
          10,
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithInclusiveMinExclusiveMax,
          55,
        );
        expect(result.success).toBe(true);
      });

      it('should reject values below inclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithInclusiveMinExclusiveMax,
          9,
        );
        expect(result.success).toBe(false);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vIntegerWithInclusiveMinExclusiveMax,
          100,
        );
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Format-Specific Constraints (Int64)', () => {
    describe('Int64WithMinimum', () => {
      it('should accept BigInt values at minimum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinimum,
          BigInt('-5000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values above minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinimum,
          BigInt('0'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values below minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinimum,
          BigInt('-5000000000001'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('Int64WithMaximum', () => {
      it('should accept BigInt values at maximum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMaximum,
          BigInt('5000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values below maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMaximum,
          BigInt('1000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values above maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMaximum,
          BigInt('5000000000001'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('Int64WithMinMax', () => {
      it('should accept BigInt values within range', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinMax,
          BigInt('0'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values at minimum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinMax,
          BigInt('-4000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values at maximum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinMax,
          BigInt('4000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values below minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinMax,
          BigInt('-4000000000001'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject BigInt values above maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithMinMax,
          BigInt('4000000000001'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('Int64WithExclusiveMin', () => {
      it('should accept BigInt values above exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMin,
          BigInt('-2999999999999'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMin,
          BigInt('-3000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('Int64WithExclusiveMax', () => {
      it('should accept BigInt values below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMax,
          BigInt('2999999999999'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMax,
          BigInt('3000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('Int64WithExclusiveMinMax', () => {
      it('should accept BigInt values within exclusive range', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMinMax,
          BigInt('0'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMinMax,
          BigInt('-2000000000000'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject BigInt values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMinMax,
          BigInt('2000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('Int64WithExclusiveMinInclusiveMax', () => {
      it('should accept values above exclusive minimum and at inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMinInclusiveMax,
          BigInt('6000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above exclusive minimum and below inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMinInclusiveMax,
          BigInt('0'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMinInclusiveMax,
          BigInt('-6000000000000'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject values above inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithExclusiveMinInclusiveMax,
          BigInt('6000000000001'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('Int64WithInclusiveMinExclusiveMax', () => {
      it('should accept values at inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithInclusiveMinExclusiveMax,
          BigInt('-7000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithInclusiveMinExclusiveMax,
          BigInt('0'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject values below inclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithInclusiveMinExclusiveMax,
          BigInt('-7000000000001'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vInt64WithInclusiveMinExclusiveMax,
          BigInt('7000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Format-Specific Constraints (UInt64)', () => {
    describe('UInt64WithMinimum', () => {
      it('should accept BigInt values at minimum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinimum,
          BigInt('5000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values above minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinimum,
          BigInt('8000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values below minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinimum,
          BigInt('4999999999999'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('UInt64WithMaximum', () => {
      it('should accept BigInt values at maximum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMaximum,
          BigInt('15000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values below maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMaximum,
          BigInt('10000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values above maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMaximum,
          BigInt('15000000000001'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('UInt64WithMinMax', () => {
      it('should accept BigInt values within range', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinMax,
          BigInt('5000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values at minimum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinMax,
          BigInt('1000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept BigInt values at maximum boundary', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinMax,
          BigInt('10000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values below minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinMax,
          BigInt('999999999999'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject BigInt values above maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithMinMax,
          BigInt('10000000000001'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('UInt64WithExclusiveMin', () => {
      it('should accept BigInt values above exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMin,
          BigInt('8000000000001'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMin,
          BigInt('8000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('UInt64WithExclusiveMax', () => {
      it('should accept BigInt values below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMax,
          BigInt('11999999999999'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMax,
          BigInt('12000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('UInt64WithExclusiveMinMax', () => {
      it('should accept BigInt values within exclusive range', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMinMax,
          BigInt('5000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject BigInt values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMinMax,
          BigInt('2000000000000'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject BigInt values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMinMax,
          BigInt('8000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('UInt64WithExclusiveMinInclusiveMax', () => {
      it('should accept values above exclusive minimum and at inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMinInclusiveMax,
          BigInt('13000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above exclusive minimum and below inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMinInclusiveMax,
          BigInt('8000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMinInclusiveMax,
          BigInt('3000000000000'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject values above inclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithExclusiveMinInclusiveMax,
          BigInt('13000000000001'),
        );
        expect(result.success).toBe(false);
      });
    });

    describe('UInt64WithInclusiveMinExclusiveMax', () => {
      it('should accept values at inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithInclusiveMinExclusiveMax,
          BigInt('4000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should accept values above inclusive minimum and below exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithInclusiveMinExclusiveMax,
          BigInt('9000000000000'),
        );
        expect(result.success).toBe(true);
      });

      it('should reject values below inclusive minimum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithInclusiveMinExclusiveMax,
          BigInt('3999999999999'),
        );
        expect(result.success).toBe(false);
      });

      it('should reject values at exclusive maximum', () => {
        const result = v.safeParse(
          generatedSchemas.vUInt64WithInclusiveMinExclusiveMax,
          BigInt('14000000000000'),
        );
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Special Cases', () => {
    describe('PrecedenceTest', () => {
      it('should use exclusive constraints over inclusive (exclusive minimum takes precedence)', () => {
        // exclusiveMinimum: 5, minimum: 10 - exclusive should take precedence
        const result = v.safeParse(generatedSchemas.vPrecedenceTest, 6);
        expect(result.success).toBe(true);
      });

      it('should use exclusive constraints over inclusive (exclusive maximum takes precedence)', () => {
        // exclusiveMaximum: 95, maximum: 90 - exclusive should take precedence
        const result = v.safeParse(generatedSchemas.vPrecedenceTest, 94);
        expect(result.success).toBe(true);
      });

      it('should reject values at exclusive minimum boundary', () => {
        const result = v.safeParse(generatedSchemas.vPrecedenceTest, 5);
        expect(result.success).toBe(false);
      });

      it('should reject values at exclusive maximum boundary', () => {
        const result = v.safeParse(generatedSchemas.vPrecedenceTest, 95);
        expect(result.success).toBe(false);
      });
    });
  });
});
