// @ts-ignore
import { createClient, getConfig } from '@hey-api/openapi-ts';
// @ts-ignore
import type { Plugin } from 'vite';

type OpenApiConfig = Parameters<typeof createClient>[0];

export interface HeyApiPluginOptions {
  config?: OpenApiConfig;
  vite?: Omit<Plugin, 'configResolved' | 'name'>;
}

export function heyApiPlugin(options?: HeyApiPluginOptions): Plugin {
  let pluginConfig = options?.config;

  return {
    enforce: 'pre',
    ...options?.vite,
    async configResolved() {
      if (!pluginConfig) {
        try {
          const resolvedConfig = await getConfig();
          if (resolvedConfig) {
            pluginConfig = resolvedConfig;
          }
        } catch {
          console.warn(
            '[@hey-api/vite-plugin] No configuration provided and default config file not found.',
          );
        }
      }

      if (pluginConfig) {
        await createClient(pluginConfig);
      }
    },
    name: 'hey-api-plugin',
  };
}

describe('createClient', () => {
  it('handles deep path $ref without errors', async () => {
    const config: OpenApiConfig = {
      dryRun: true,
      input: {
        components: {
          schemas: {
            Bar: {
              properties: {
                nested: {
                  $ref: '#/components/schemas/Foo/properties/items/items',
                },
              },
              type: 'object',
            },
            Foo: {
              properties: {
                items: {
                  items: {
                    properties: {
                      name: { type: 'string' },
                    },
                    type: 'object',
                  },
                  type: 'array',
                },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'deep-ref-test', version: '1.0.0' },
        openapi: '3.1.0',
      },
      logs: {
        level: 'silent',
      },
      output: 'output',
      plugins: ['@hey-api/typescript'],
    };

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('handles deep path $ref in OpenAPI 3.0.x without errors', async () => {
    const config: OpenApiConfig = {
      dryRun: true,
      input: {
        components: {
          schemas: {
            Bar: {
              properties: {
                nested: {
                  $ref: '#/components/schemas/Foo/properties/items/items',
                },
              },
              type: 'object',
            },
            Foo: {
              properties: {
                items: {
                  items: {
                    properties: {
                      name: { type: 'string' },
                    },
                    type: 'object',
                  },
                  type: 'array',
                },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'deep-ref-test', version: '1.0.0' },
        openapi: '3.0.0',
        paths: {},
      },
      logs: {
        level: 'silent',
      },
      output: 'output',
      plugins: ['@hey-api/typescript'],
    };

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('handles deep path $ref in OpenAPI 2.0 (Swagger) without errors', async () => {
    const config: OpenApiConfig = {
      dryRun: true,
      input: {
        definitions: {
          Bar: {
            properties: {
              nested: {
                $ref: '#/definitions/Foo/properties/items/items',
              },
            },
            type: 'object',
          },
          Foo: {
            properties: {
              items: {
                items: {
                  properties: {
                    name: { type: 'string' },
                  },
                  type: 'object',
                },
                type: 'array',
              },
            },
            type: 'object',
          },
        },
        info: { title: 'deep-ref-test', version: '1.0.0' },
        paths: {},
        swagger: '2.0',
      },
      logs: {
        level: 'silent',
      },
      output: 'output',
      plugins: ['@hey-api/typescript'],
    };

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('1 config, 1 input, 1 output', async () => {
    const config: OpenApiConfig = {
      dryRun: true,
      input: {
        info: { title: 'foo', version: '1.0.0' },
        openapi: '3.0.0',
      },
      logs: {
        level: 'silent',
      },
      output: 'output',
      plugins: ['@hey-api/typescript'],
    };

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('1 config, 2 inputs, 1 output', async () => {
    const config: OpenApiConfig = {
      dryRun: true,
      input: [
        {
          info: { title: 'foo', version: '1.0.0' },
          openapi: '3.0.0',
        },
        {
          info: { title: 'bar', version: '1.0.0' },
          openapi: '3.0.0',
          paths: {},
        },
      ],
      logs: {
        level: 'silent',
      },
      output: 'output',
      plugins: ['@hey-api/typescript'],
    };

    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('1 config, 2 inputs, 2 outputs', async () => {
    const config: OpenApiConfig = {
      dryRun: true,
      input: [
        {
          info: { title: 'foo', version: '1.0.0' },
          openapi: '3.0.0',
        },
        {
          info: { title: 'bar', version: '1.0.0' },
          openapi: '3.0.0',
          paths: {},
        },
      ],
      logs: {
        level: 'silent',
      },
      output: ['output', 'output2'],
      plugins: ['@hey-api/typescript'],
    };

    const results = await createClient(config);
    expect(results).toHaveLength(2);
  });

  it('2 configs, 1 input, 1 output', async () => {
    const config: OpenApiConfig = [
      {
        dryRun: true,
        input: {
          info: { title: 'foo', version: '1.0.0' },
          openapi: '3.0.0',
        },
        logs: {
          level: 'silent',
        },
        output: 'output',
        plugins: ['@hey-api/typescript'],
      },
      {
        dryRun: true,
        input: {
          info: { title: 'bar', version: '1.0.0' },
          openapi: '3.0.0',
        },
        logs: {
          level: 'silent',
        },
        output: 'output2',
        plugins: ['@hey-api/typescript'],
      },
    ];

    const results = await createClient(config);
    expect(results).toHaveLength(2);
  });

  it('2 configs, 2 inputs, 2 outputs', async () => {
    const config: OpenApiConfig = [
      {
        dryRun: true,
        input: [
          {
            info: { title: 'foo', version: '1.0.0' },
            openapi: '3.0.0',
          },
          {
            info: { title: 'bar', version: '1.0.0' },
            openapi: '3.0.0',
            paths: {},
          },
        ],
        logs: {
          level: 'silent',
        },
        output: ['output', 'output2'],
        plugins: ['@hey-api/typescript'],
      },
      {
        dryRun: true,
        input: [
          {
            info: { title: 'baz', version: '1.0.0' },
            openapi: '3.0.0',
          },
          {
            info: { title: 'qux', version: '1.0.0' },
            openapi: '3.0.0',
            paths: {},
          },
        ],
        logs: {
          level: 'silent',
        },
        output: ['output3', 'output4'],
        plugins: ['@hey-api/typescript'],
      },
    ];

    const results = await createClient(config);
    expect(results).toHaveLength(4);
  });

  it('executes @angular/common HttpRequest builder path', async () => {
    const results = await createClient({
      dryRun: true,
      input: {
        info: { title: 'angular-common-test', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/pets': {
            get: {
              operationId: 'listPets',
              responses: {
                200: {
                  content: {
                    'application/json': {
                      schema: {
                        items: { type: 'string' },
                        type: 'array',
                      },
                    },
                  },
                  description: 'ok',
                },
              },
            },
          },
        },
      },
      logs: { level: 'silent' },
      output: 'out',
      plugins: [
        '@hey-api/typescript',
        '@hey-api/sdk',
        '@angular/common',
        '@hey-api/client-angular',
      ],
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});
