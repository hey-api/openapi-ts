import {
  getRegistryUrl,
  inputToReadmePath,
  type Parsed,
  parseShorthand,
} from '../readme';

describe('readme utils', () => {
  describe('parseShorthand', () => {
    it('should parse simple UUID format', () => {
      const result = parseShorthand('abc123');
      expect(result).toEqual({ uuid: 'abc123' });
    });

    it('should parse UUID with hyphens', () => {
      const result = parseShorthand('test-uuid-123');
      expect(result).toEqual({ uuid: 'test-uuid-123' });
    });

    it('should parse full format with organization and project', () => {
      const result = parseShorthand('@myorg/myproject#uuid123');
      expect(result).toEqual({
        organization: 'myorg',
        project: 'myproject',
        uuid: 'uuid123',
      });
    });

    it('should parse organization and project with hyphens', () => {
      const result = parseShorthand('@my-org/my-project#test-uuid');
      expect(result).toEqual({
        organization: 'my-org',
        project: 'my-project',
        uuid: 'test-uuid',
      });
    });

    it('should throw error for invalid formats', () => {
      expect(() => parseShorthand('')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => parseShorthand('@org')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => parseShorthand('@org/project')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => parseShorthand('@org/project#')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => parseShorthand('https://example.com')).toThrow(
        'Invalid ReadMe shorthand format',
      );
    });

    it('should throw error for invalid UUID characters', () => {
      expect(() => parseShorthand('abc@123')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => parseShorthand('abc/123')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => parseShorthand('abc#123')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => parseShorthand('abc 123')).toThrow(
        'Invalid ReadMe shorthand format',
      );
    });

    it('should handle empty UUID', () => {
      expect(() => parseShorthand('@org/project#')).toThrow(
        'Invalid ReadMe shorthand format',
      );
    });
  });

  describe('getRegistryUrl', () => {
    it('should generate correct URL', () => {
      expect(getRegistryUrl('abc123')).toBe(
        'https://dash.readme.com/api/v1/api-registry/abc123',
      );
      expect(getRegistryUrl('test-uuid-with-hyphens')).toBe(
        'https://dash.readme.com/api/v1/api-registry/test-uuid-with-hyphens',
      );
    });
  });

  describe('inputToReadmePath', () => {
    it('should transform simple UUID format to API URL', () => {
      const result = inputToReadmePath('readme:abc123');
      expect(result).toEqual({
        path: 'https://dash.readme.com/api/v1/api-registry/abc123',
        registry: 'readme',
        uuid: 'abc123',
      });
    });

    it('should transform full format to API URL', () => {
      const result = inputToReadmePath('readme:@myorg/myproject#uuid123');
      expect(result).toEqual({
        organization: 'myorg',
        path: 'https://dash.readme.com/api/v1/api-registry/uuid123',
        project: 'myproject',
        registry: 'readme',
        uuid: 'uuid123',
      });
    });

    it('should throw error for invalid inputs', () => {
      expect(() => inputToReadmePath('invalid')).toThrow(
        'Invalid ReadMe shorthand format',
      );
      expect(() => inputToReadmePath('')).toThrow(
        'Invalid ReadMe shorthand format',
      );
    });
  });

  describe('integration scenarios', () => {
    const validInputs: ReadonlyArray<{ expected: Parsed; input: string }> = [
      { expected: { uuid: 'simple123' }, input: 'simple123' },
      {
        expected: { uuid: 'uuid-with-hyphens' },
        input: 'uuid-with-hyphens',
      },
      { expected: { uuid: 'UUID123' }, input: 'UUID123' },
      {
        expected: { organization: 'org', project: 'proj', uuid: 'uuid' },
        input: '@org/proj#uuid',
      },
      {
        expected: {
          organization: 'my-org',
          project: 'my-project',
          uuid: 'my-uuid',
        },
        input: '@my-org/my-project#my-uuid',
      },
    ];

    it.each(validInputs)(
      'should handle $input correctly',
      ({ expected, input }) => {
        expect(parseShorthand(input)).toEqual(expected);
        expect(inputToReadmePath(`readme:${input}`)).toEqual({
          organization: expected.organization,
          path: `https://dash.readme.com/api/v1/api-registry/${expected.uuid}`,
          project: expected.project,
          registry: 'readme',
          uuid: expected.uuid,
        });
      },
    );

    const invalidInputs = [
      '',
      '@',
      '@org',
      '@org/',
      '@org/proj',
      '@org/proj#',
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
