import { describe, expect, it } from 'vitest';

import type { UserConfig } from '../types/config';

describe('main entry index', () => {
  describe('createClient', () => {
    it('should be exported', async () => {
      const { createClient } = await import('../index');
      expect(createClient).toBeDefined();
    });

    it('should handle single output configuration', async () => {
      const { createClient } = await import('../index');

      const config: UserConfig = {
        dryRun: true,
        input: {
          info: { title: 'Test API', version: '1.0.0' },
          openapi: '3.0.0',
          paths: {},
        },
        output: 'test-output',
        plugins: ['@hey-api/typescript'],
      };

      const results = await createClient(config);
      expect(results).toHaveLength(1);
    });

    it('should handle multiple string outputs', async () => {
      const { createClient } = await import('../index');

      const config: UserConfig = {
        dryRun: true,
        input: {
          info: { title: 'Test API', version: '1.0.0' },
          openapi: '3.0.0',
          paths: {},
        },
        output: ['test-output-1', 'test-output-2', 'test-output-3'],
        plugins: ['@hey-api/typescript'],
      };

      const results = await createClient(config);
      expect(results).toHaveLength(3);
    });

    it('should handle multiple output objects with different configurations', async () => {
      const { createClient } = await import('../index');

      const config: UserConfig = {
        dryRun: true,
        input: {
          info: { title: 'Test API', version: '1.0.0' },
          openapi: '3.0.0',
          paths: {},
        },
        output: [
          {
            clean: true,
            format: 'prettier',
            path: 'test-output-formatted',
          },
          {
            clean: false,
            lint: 'eslint',
            path: 'test-output-linted',
          },
        ],
        plugins: ['@hey-api/typescript'],
      };

      const results = await createClient(config);
      expect(results).toHaveLength(2);
    });

    it('should handle mixed string and object outputs', async () => {
      const { createClient } = await import('../index');

      const config: UserConfig = {
        dryRun: true,
        input: {
          info: { title: 'Test API', version: '1.0.0' },
          openapi: '3.0.0',
          paths: {},
        },
        output: [
          'test-simple-output',
          {
            format: 'prettier',
            indexFile: false,
            path: 'test-advanced-output',
          },
        ],
        plugins: ['@hey-api/typescript'],
      };

      const results = await createClient(config);
      expect(results).toHaveLength(2);
    });

    it('should preserve global config across multiple outputs', async () => {
      const { createClient } = await import('../index');

      const config: UserConfig = {
        dryRun: true,
        experimentalParser: true,
        input: {
          info: { title: 'Test API', version: '1.0.0' },
          openapi: '3.0.0',
          paths: {
            '/test': {
              get: {
                responses: {
                  '200': {
                    content: {
                      'application/json': {
                        schema: { type: 'string' },
                      },
                    },
                    description: 'Success',
                  },
                },
              },
            },
          },
        },
        output: ['output-1', 'output-2'],
        plugins: ['@hey-api/typescript'],
      };

      const results = await createClient(config);
      expect(results).toHaveLength(2);

      // Both results should be IR.Context objects (due to experimentalParser: true)
      // and should have the same input specification
      results.forEach((result) => {
        if ('spec' in result) {
          expect(result.spec.info.title).toBe('Test API');
          expect(result.config.experimentalParser).toBe(true);
        }
      });
    });
  });
});
