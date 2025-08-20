import { describe, expect, it } from 'vitest';

import {
  getRegistryUrl,
  inputToScalarPath,
  type Parsed,
  parseShorthand,
} from '../scalar';

describe('readme utils', () => {
  describe('parseShorthand', () => {
    it('should parse full format with organization and project', () => {
      const result = parseShorthand('@myorg/myproject');
      expect(result).toEqual({
        organization: '@myorg',
        project: 'myproject',
      });
    });

    it('should parse organization and project with hyphens', () => {
      const result = parseShorthand('@my-org/my-project');
      expect(result).toEqual({
        organization: '@my-org',
        project: 'my-project',
      });
    });

    it('should throw error for invalid formats', () => {
      expect(() => parseShorthand('')).toThrow(
        'Invalid Scalar shorthand format',
      );
      expect(() => parseShorthand('@org')).toThrow(
        'Invalid Scalar shorthand format',
      );
      expect(() => parseShorthand('@org/project#')).toThrow(
        'Invalid Scalar shorthand format',
      );
      expect(() => parseShorthand('https://example.com')).toThrow(
        'Invalid Scalar shorthand format',
      );
    });

    it('should throw error for invalid UUID characters', () => {
      expect(() => parseShorthand('abc@123')).toThrow(
        'Invalid Scalar shorthand format',
      );
      expect(() => parseShorthand('abc/123')).toThrow(
        'Invalid Scalar shorthand format',
      );
      expect(() => parseShorthand('abc#123')).toThrow(
        'Invalid Scalar shorthand format',
      );
      expect(() => parseShorthand('abc 123')).toThrow(
        'Invalid Scalar shorthand format',
      );
    });

    it('should handle empty UUID', () => {
      expect(() => parseShorthand('@org/project#')).toThrow(
        'Invalid Scalar shorthand format',
      );
    });
  });

  describe('getRegistryUrl', () => {
    it('should generate correct URL', () => {
      expect(getRegistryUrl('@foo', 'bar')).toBe(
        'https://registry.scalar.com/@foo/apis/bar/latest?format=json',
      );
      expect(getRegistryUrl('@foo-with-hyphens', 'bar')).toBe(
        'https://registry.scalar.com/@foo-with-hyphens/apis/bar/latest?format=json',
      );
    });
  });

  describe('inputToScalarPath', () => {
    it('should transform full format to API URL', () => {
      const result = inputToScalarPath('scalar:@foo/bar');
      expect(result).toBe(
        'https://registry.scalar.com/@foo/apis/bar/latest?format=json',
      );
    });

    it('should throw error for invalid inputs', () => {
      expect(() => inputToScalarPath('invalid')).toThrow(
        'Invalid Scalar shorthand format',
      );
      expect(() => inputToScalarPath('')).toThrow(
        'Invalid Scalar shorthand format',
      );
    });
  });

  describe('integration scenarios', () => {
    const validInputs: ReadonlyArray<{ expected: Parsed; input: string }> = [
      {
        expected: { organization: '@org', project: 'proj' },
        input: '@org/proj',
      },
      {
        expected: {
          organization: '@my-org',
          project: 'my-project',
        },
        input: '@my-org/my-project',
      },
    ];

    it.each(validInputs)(
      'should handle $input correctly',
      ({ expected, input }) => {
        expect(parseShorthand(input)).toEqual(expected);
        expect(inputToScalarPath(`scalar:${input}`)).toBe(
          `https://registry.scalar.com/${expected.organization}/apis/${expected.project}/latest?format=json`,
        );
      },
    );

    const invalidInputs = [
      '',
      '@',
      '@org',
      '@org/',
      'uuid with spaces',
      'uuid@invalid',
      'uuid/invalid',
      'uuid#invalid',
      'https://example.com',
      './local-file.yaml',
    ];

    it.each(invalidInputs)('should reject invalid input: %s', (input) => {
      expect(() => parseShorthand(input)).toThrow();
    });
  });
});
