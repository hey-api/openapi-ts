import type { MaybeArray } from '@hey-api/types';

import { getInput } from '../input';
import type { UserInput, UserWatch } from '../types';

type UserConfig = {
  input: MaybeArray<UserInput | Required<UserInput>['path']>;
  watch?: UserWatch;
};

describe('input config', () => {
  describe('getInput', () => {
    it('should handle string input', () => {
      const userConfig: UserConfig = {
        input: 'https://example.com/openapi.yaml',
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe('https://example.com/openapi.yaml');
    });

    it('should transform ReadMe simple format input', () => {
      const userConfig: UserConfig = {
        input: 'readme:abc123',
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe(
        'https://dash.readme.com/api/v1/api-registry/abc123',
      );
    });

    it('should transform ReadMe full format input', () => {
      const userConfig: UserConfig = {
        input: 'readme:@myorg/myproject#uuid123',
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe(
        'https://dash.readme.com/api/v1/api-registry/uuid123',
      );
    });

    it('should handle ReadMe input with hyphens', () => {
      const userConfig: UserConfig = {
        input: 'readme:@my-org/my-project#test-uuid-123',
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe(
        'https://dash.readme.com/api/v1/api-registry/test-uuid-123',
      );
    });

    it('should handle object input with ReadMe path', () => {
      const userConfig: UserConfig = {
        input: {
          fetch: {
            headers: {
              Authorization: 'Bearer token',
            },
          },
          path: 'readme:abc123',
        },
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe(
        'https://dash.readme.com/api/v1/api-registry/abc123',
      );
    });

    it('should handle object input with ReadMe full format path', () => {
      const userConfig: UserConfig = {
        input: {
          path: 'readme:@org/project#uuid',
          watch: true,
        },
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe(
        'https://dash.readme.com/api/v1/api-registry/uuid',
      );
      expect(result.watch.enabled).toBe(true);
    });

    it('should handle HeyAPI input format (existing functionality)', () => {
      const userConfig: UserConfig = {
        input: {
          organization: 'myorg',
          project: 'myproject',
        },
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe('https://get.heyapi.dev/myorg/myproject');
    });

    it('should handle object input (existing functionality)', () => {
      const userConfig: UserConfig = {
        input: {
          info: { title: 'Test API', version: '1.0.0' },
          openapi: '3.0.0',
        },
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toEqual({
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.0.0',
      });
    });

    it('should not transform non-ReadMe string inputs', () => {
      const inputs = [
        'https://example.com/openapi.yaml',
        './local-file.yaml',
        '/absolute/path/to/file.json',
        'file.yaml',
      ];

      inputs.forEach((input) => {
        const userConfig: UserConfig = { input };
        const result = getInput(userConfig)[0]!;
        expect(result.path).toBe(input);
      });
    });

    it('should handle watch options with ReadMe inputs', () => {
      const userConfig: UserConfig = {
        input: 'readme:abc123',
        watch: {
          enabled: true,
          interval: 2000,
        },
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe(
        'https://dash.readme.com/api/v1/api-registry/abc123',
      );
      expect(result.watch.enabled).toBe(true);
      expect(result.watch.interval).toBe(2000);
    });

    it('should preserve other input object properties when transforming ReadMe path', () => {
      const userConfig: UserConfig = {
        input: {
          fetch: {
            headers: { 'X-Custom': 'value' },
          },
          path: 'readme:test123',
          watch: { enabled: true, interval: 1500 },
        },
      };

      const result = getInput(userConfig)[0]!;
      expect(result.path).toBe(
        'https://dash.readme.com/api/v1/api-registry/test123',
      );
      // Note: fetch options are preserved in the input object, not in the result
      // The watch options should be processed separately
      expect(result.watch.enabled).toBe(true);
      expect(result.watch.interval).toBe(1500);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid ReadMe format', () => {
      const userConfig: UserConfig = {
        input: 'readme:',
      };

      expect(() => getInput(userConfig)).toThrow(
        'Invalid ReadMe shorthand format',
      );
    });

    it('should throw error for invalid ReadMe UUID', () => {
      const userConfig: UserConfig = {
        input: 'readme:invalid uuid with spaces',
      };

      expect(() => getInput(userConfig)).toThrow(
        'Invalid ReadMe shorthand format',
      );
    });

    it('should throw error for invalid ReadMe format in object input', () => {
      const userConfig: UserConfig = {
        input: {
          path: 'readme:@org/project',
        },
      };

      expect(() => getInput(userConfig)).toThrow(
        'Invalid ReadMe shorthand format',
      );
    });
  });
});
