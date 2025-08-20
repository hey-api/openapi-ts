import { describe, expect, it } from 'vitest';

import {
  getReadmeApiUrl,
  isReadmeInput,
  parseReadmeInput,
  type ReadmeInput,
  transformReadmeInput,
} from '../readme';

describe('readme utils', () => {
  describe('isReadmeInput', () => {
    it('should return true for valid ReadMe formats', () => {
      expect(isReadmeInput('readme:abc123')).toBe(true);
      expect(isReadmeInput('readme:@org/project#uuid123')).toBe(true);
      expect(isReadmeInput('readme:test-uuid-with-hyphens')).toBe(true);
    });

    it('should return false for non-ReadMe inputs', () => {
      expect(isReadmeInput('https://example.com')).toBe(false);
      expect(isReadmeInput('./local-file.yaml')).toBe(false);
      expect(isReadmeInput('random-string')).toBe(false);
      expect(isReadmeInput('')).toBe(false);
      expect(isReadmeInput('readme')).toBe(false);
      expect(isReadmeInput('readmeabc123')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isReadmeInput(123 as any)).toBe(false);
      expect(isReadmeInput(null as any)).toBe(false);
      expect(isReadmeInput(undefined as any)).toBe(false);
      expect(isReadmeInput({} as any)).toBe(false);
    });
  });

  describe('parseReadmeInput', () => {
    it('should parse simple UUID format', () => {
      const result = parseReadmeInput('readme:abc123');
      expect(result).toEqual({ uuid: 'abc123' });
    });

    it('should parse UUID with hyphens', () => {
      const result = parseReadmeInput('readme:test-uuid-123');
      expect(result).toEqual({ uuid: 'test-uuid-123' });
    });

    it('should parse full format with organization and project', () => {
      const result = parseReadmeInput('readme:@myorg/myproject#uuid123');
      expect(result).toEqual({
        organization: 'myorg',
        project: 'myproject',
        uuid: 'uuid123',
      });
    });

    it('should parse organization and project with hyphens', () => {
      const result = parseReadmeInput('readme:@my-org/my-project#test-uuid');
      expect(result).toEqual({
        organization: 'my-org',
        project: 'my-project',
        uuid: 'test-uuid',
      });
    });

    it('should throw error for invalid formats', () => {
      expect(() => parseReadmeInput('readme:')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => parseReadmeInput('readme:@org')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => parseReadmeInput('readme:@org/project')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => parseReadmeInput('readme:@org/project#')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => parseReadmeInput('https://example.com')).toThrow(
        'Invalid ReadMe input format',
      );
    });

    it('should throw error for invalid UUID characters', () => {
      expect(() => parseReadmeInput('readme:abc@123')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => parseReadmeInput('readme:abc/123')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => parseReadmeInput('readme:abc#123')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => parseReadmeInput('readme:abc 123')).toThrow(
        'Invalid ReadMe input format',
      );
    });

    it('should handle empty UUID', () => {
      expect(() => parseReadmeInput('readme:@org/project#')).toThrow(
        'Invalid ReadMe input format',
      );
    });
  });

  describe('getReadmeApiUrl', () => {
    it('should generate correct API URL', () => {
      expect(getReadmeApiUrl('abc123')).toBe(
        'https://dash.readme.com/api/v1/api-registry/abc123',
      );
      expect(getReadmeApiUrl('test-uuid-with-hyphens')).toBe(
        'https://dash.readme.com/api/v1/api-registry/test-uuid-with-hyphens',
      );
    });
  });

  describe('transformReadmeInput', () => {
    it('should transform simple UUID format to API URL', () => {
      const result = transformReadmeInput('readme:abc123');
      expect(result).toBe('https://dash.readme.com/api/v1/api-registry/abc123');
    });

    it('should transform full format to API URL', () => {
      const result = transformReadmeInput('readme:@myorg/myproject#uuid123');
      expect(result).toBe(
        'https://dash.readme.com/api/v1/api-registry/uuid123',
      );
    });

    it('should throw error for invalid inputs', () => {
      expect(() => transformReadmeInput('invalid')).toThrow(
        'Invalid ReadMe input format',
      );
      expect(() => transformReadmeInput('readme:')).toThrow(
        'Invalid ReadMe input format',
      );
    });
  });

  describe('integration scenarios', () => {
    const validInputs: Array<{ expected: ReadmeInput; input: string }> = [
      { expected: { uuid: 'simple123' }, input: 'readme:simple123' },
      {
        expected: { uuid: 'uuid-with-hyphens' },
        input: 'readme:uuid-with-hyphens',
      },
      { expected: { uuid: 'UUID123' }, input: 'readme:UUID123' },
      {
        expected: { organization: 'org', project: 'proj', uuid: 'uuid' },
        input: 'readme:@org/proj#uuid',
      },
      {
        expected: {
          organization: 'my-org',
          project: 'my-project',
          uuid: 'my-uuid',
        },
        input: 'readme:@my-org/my-project#my-uuid',
      },
    ];

    it.each(validInputs)(
      'should handle $input correctly',
      ({ expected, input }) => {
        expect(isReadmeInput(input)).toBe(true);
        expect(parseReadmeInput(input)).toEqual(expected);
        expect(transformReadmeInput(input)).toBe(
          `https://dash.readme.com/api/v1/api-registry/${expected.uuid}`,
        );
      },
    );

    const invalidInputs = [
      'readme:',
      'readme:@',
      'readme:@org',
      'readme:@org/',
      'readme:@org/proj',
      'readme:@org/proj#',
      'readme:uuid with spaces',
      'readme:uuid@invalid',
      'readme:uuid/invalid',
      'readme:uuid#invalid',
      'https://example.com',
      './local-file.yaml',
      'random-string',
      '',
    ];

    it.each(invalidInputs)('should reject invalid input: %s', (input) => {
      if (isReadmeInput(input)) {
        expect(() => parseReadmeInput(input)).toThrow();
      } else {
        expect(() => parseReadmeInput(input)).toThrow(
          'Invalid ReadMe input format',
        );
      }
    });
  });
});
