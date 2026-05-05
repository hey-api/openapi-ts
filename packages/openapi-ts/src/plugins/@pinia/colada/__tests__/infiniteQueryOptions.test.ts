import { createClient } from '../../../../index';

type Config = Parameters<typeof createClient>[0];

const baseConfig = (overrides: Partial<Config>): Config =>
  ({
    dryRun: true,
    logs: { level: 'silent' },
    output: 'output',
    ...overrides,
  }) as Config;

describe('@pinia/colada infiniteQueryOptions', () => {
  it('emits InfiniteQuery helpers for numeric cursor pagination', async () => {
    const config = baseConfig({
      input: {
        info: { title: 'numeric-cursor', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/albums': {
            get: {
              operationId: 'getAlbums',
              parameters: [
                {
                  in: 'query',
                  name: 'cursor',
                  schema: {
                    anyOf: [{ type: 'integer' }, { type: 'null' }],
                  },
                },
              ],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { items: { type: 'object' }, type: 'array' },
                    },
                  },
                  description: 'ok',
                },
              },
            },
          },
        },
      },
      plugins: ['@hey-api/typescript', '@hey-api/sdk', '@pinia/colada', '@hey-api/client-fetch'],
    });

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('emits InfiniteQuery helpers for string cursor pagination', async () => {
    const config = baseConfig({
      input: {
        info: { title: 'string-cursor', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/products': {
            get: {
              operationId: 'getProducts',
              parameters: [
                {
                  in: 'query',
                  name: 'cursor',
                  schema: {
                    anyOf: [{ format: 'date-time', type: 'string' }, { type: 'null' }],
                  },
                },
              ],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { items: { type: 'object' }, type: 'array' },
                    },
                  },
                  description: 'ok',
                },
              },
            },
          },
        },
      },
      plugins: ['@hey-api/typescript', '@hey-api/sdk', '@pinia/colada', '@hey-api/client-fetch'],
    });

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('emits InfiniteQuery helpers when pagination lives in a nested ref', async () => {
    const config = baseConfig({
      input: {
        components: {
          schemas: {
            Filter: {
              properties: {
                page: {
                  type: ['integer', 'null'],
                },
                size: {
                  type: ['integer', 'null'],
                },
              },
              required: ['page', 'size'],
              type: 'object',
            },
          },
        },
        info: { title: 'nested-pagination', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/foo': {
            get: {
              operationId: 'getFoo',
              parameters: [
                {
                  in: 'query',
                  name: 'filter',
                  required: true,
                  schema: { $ref: '#/components/schemas/Filter' },
                },
              ],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { items: { type: 'object' }, type: 'array' },
                    },
                  },
                  description: 'ok',
                },
              },
            },
          },
        },
      },
      plugins: ['@hey-api/typescript', '@hey-api/sdk', '@pinia/colada', '@hey-api/client-fetch'],
    });

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('does not throw when pagination operation coexists with a regular operation', async () => {
    const config = baseConfig({
      input: {
        info: { title: 'mixed-ops', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              parameters: [
                {
                  in: 'query',
                  name: 'cursor',
                  schema: { type: 'integer' },
                },
              ],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { items: { type: 'object' }, type: 'array' },
                    },
                  },
                  description: 'ok',
                },
              },
            },
          },
          '/status': {
            get: {
              operationId: 'getStatus',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                  description: 'ok',
                },
              },
            },
          },
        },
      },
      plugins: ['@hey-api/typescript', '@hey-api/sdk', '@pinia/colada', '@hey-api/client-fetch'],
    });

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('skips InfiniteQuery emission when infiniteQueryOptions is disabled', async () => {
    const config = baseConfig({
      input: {
        info: { title: 'disabled', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/items': {
            get: {
              operationId: 'getItems',
              parameters: [
                {
                  in: 'query',
                  name: 'cursor',
                  schema: { type: 'integer' },
                },
              ],
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { items: { type: 'object' }, type: 'array' },
                    },
                  },
                  description: 'ok',
                },
              },
            },
          },
        },
      },
      plugins: [
        '@hey-api/typescript',
        '@hey-api/sdk',
        { infiniteQueryOptions: false, name: '@pinia/colada' },
        '@hey-api/client-fetch',
      ],
    });

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });
});
