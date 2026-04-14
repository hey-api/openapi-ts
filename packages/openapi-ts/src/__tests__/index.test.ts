import { createClient } from '../index';

type Config = Parameters<typeof createClient>[0];

describe('createClient', () => {
  it('handles deep path $ref without errors', async () => {
    // This test verifies that deep path refs like
    // #/components/schemas/Foo/properties/bar/items are inlined
    // instead of being treated as symbol references (which would fail)
    const config: Config = {
      dryRun: true,
      input: {
        components: {
          schemas: {
            Bar: {
              properties: {
                nested: {
                  // Deep path ref - should be inlined, not treated as symbol
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

    // Should not throw "Symbol finalName has not been resolved yet" error
    const results = await createClient(config);
    expect(results).toHaveLength(1);
  });

  it('handles deep path $ref in OpenAPI 3.0.x without errors', async () => {
    const config: Config = {
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
    const config: Config = {
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
    const config: Config = {
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
    const config: Config = {
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
    const config: Config = {
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
    const config: Config = [
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
    const config: Config = [
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

  describe('duplicate plugin warnings', () => {
    const baseConfig = {
      dryRun: true as const,
      input: {
        info: { title: 'duplicate-plugin-test', version: '1.0.0' },
        openapi: '3.1.0' as const,
      },
      logs: {
        level: 'silent' as const,
      },
      output: 'output',
    };

    const conflictWarnings = (warnSpy: ReturnType<typeof vi.spyOn>) =>
      warnSpy.mock.calls.filter(
        (args: unknown[]) => typeof args[0] === 'string' && args[0].includes('conflicting options'),
      );

    it('warns when the same plugin is specified with conflicting options', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: [
          { case: 'PascalCase', name: '@hey-api/typescript' },
          { case: 'camelCase', name: '@hey-api/typescript' },
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"@hey-api/typescript"'));

      warnSpy.mockRestore();
    });

    it('does not warn when the same plugin is specified twice as a string', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: ['@hey-api/typescript', '@hey-api/typescript'],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('does not warn when a string and an object with only name are specified', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: ['@hey-api/typescript', { name: '@hey-api/typescript' }],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('does not warn when two identical object configurations are specified', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: [
          { case: 'PascalCase', name: '@hey-api/typescript' },
          { case: 'PascalCase', name: '@hey-api/typescript' },
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('does not warn when objects differ only in key order', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: [
          { case: 'PascalCase', name: '@hey-api/typescript' },
          { name: '@hey-api/typescript', case: 'PascalCase' },
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('does not warn when nested object configs differ only in key order', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: [
          {
            definitions: { case: 'PascalCase', name: 'foo' },
            name: '@hey-api/typescript',
          },
          {
            name: '@hey-api/typescript',
            definitions: { name: 'foo', case: 'PascalCase' },
          },
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('warns when an object adds extra config compared to a string entry', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: ['@hey-api/typescript', { case: 'PascalCase', name: '@hey-api/typescript' }],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(1);

      warnSpy.mockRestore();
    });

    it('does not warn when array-valued options differ only in element key order', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: [
          {
            items: [{ from: 'foo', name: 'bar' }],
            name: '@hey-api/typescript',
          } as never,
          {
            items: [{ name: 'bar', from: 'foo' }],
            name: '@hey-api/typescript',
          } as never,
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('warns when array-valued options differ in element order', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: [
          {
            items: [{ from: 'a', name: 'x' }, { from: 'b', name: 'y' }],
            name: '@hey-api/typescript',
          } as never,
          {
            items: [{ from: 'b', name: 'y' }, { from: 'a', name: 'x' }],
            name: '@hey-api/typescript',
          } as never,
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(1);

      warnSpy.mockRestore();
    });

    it('does not warn when function-valued options have identical source', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const transform = (s: string) => s.toUpperCase();

      await createClient({
        ...baseConfig,
        plugins: [
          { definitions: { name: transform }, name: '@hey-api/typescript' },
          { definitions: { name: transform }, name: '@hey-api/typescript' },
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('warns when function-valued options differ', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createClient({
        ...baseConfig,
        plugins: [
          {
            definitions: { name: (s: string) => s.toUpperCase() },
            name: '@hey-api/typescript',
          },
          {
            definitions: { name: (s: string) => s.toLowerCase() },
            name: '@hey-api/typescript',
          },
        ],
      });

      expect(conflictWarnings(warnSpy)).toHaveLength(1);

      warnSpy.mockRestore();
    });
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
