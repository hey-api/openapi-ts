import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { vi } from 'vitest';

import { createClient } from '../../../../index';

type Config = Parameters<typeof createClient>[0];

const baseConfig = (overrides: Partial<Config>): Config =>
  ({
    dryRun: true,
    logs: { level: 'silent' },
    output: 'output',
    ...overrides,
  }) as Config;

const tmpRoots: Array<string> = [];
const createTmpOutput = (): string => {
  const dir = mkdtempSync(path.join(tmpdir(), `openapi-ts-pinia-${randomUUID()}-`));
  tmpRoots.push(dir);
  return dir;
};

afterAll(() => {
  for (const dir of tmpRoots) {
    try {
      rmSync(dir, { force: true, recursive: true });
    } catch {
      // best-effort cleanup
    }
  }
  tmpRoots.length = 0;
});

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

  it('emits deep-partial override type for pagination with required sibling query field', async () => {
    // Bundle copy in createClient resolves client-fetch sources via dev paths only
    // when HEYAPI_CODEGEN_ENV=development. In-source tests run from src/, where the
    // prod path (dist/clients/) does not exist — stub the env for this test only.
    vi.stubEnv('HEYAPI_CODEGEN_ENV', 'development');
    const outputDir = createTmpOutput();
    const config = baseConfig({
      dryRun: false,
      input: {
        info: { title: 'required-sibling', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/orders': {
            get: {
              operationId: 'getOrders',
              parameters: [
                {
                  in: 'query',
                  name: 'tenantId',
                  required: true,
                  schema: { type: 'integer' },
                },
                {
                  in: 'query',
                  name: 'offset',
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
      output: { path: outputDir },
      plugins: ['@hey-api/typescript', '@hey-api/sdk', '@pinia/colada', '@hey-api/client-fetch'],
    });

    try {
      const results = await createClient(config);
      expect(results).toHaveLength(1);

      const generated = readFileSync(path.join(outputDir, '@pinia', 'colada.gen.ts'), 'utf-8');

      // The override-type literal must NOT carry a cast — deep-partial must hold without it.
      expect(generated).not.toContain('as unknown as Partial<Pick<');
      // Pinia plugin must never use @ts-ignore (sanity check).
      expect(generated).not.toMatch(/@ts-ignore/);
      // Override-type is generated as inline deep-partial literal, keyed off the operation's data type.
      expect(generated).toContain("query?: Partial<Options<GetOrdersData>['query']>");
      expect(generated).toContain("body?: Partial<Options<GetOrdersData>['body']>");
      expect(generated).toContain("path?: Partial<Options<GetOrdersData>['path']>");
      // Structural narrowing between primitive- and object-form pageParam is preserved.
      expect(generated).toContain("'body' in pageParam");
      expect(generated).toContain("'path' in pageParam");
      expect(generated).toContain("'query' in pageParam");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
