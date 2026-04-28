import { updateRefsInSpec } from '../readWrite';

const createLogger = () =>
  ({
    timeEvent: () => ({
      timeEnd: () => {},
    }),
  }) as any;

describe('updateRefsInSpec', () => {
  it('falls back to read variant when write variant is missing', () => {
    const spec: any = {
      components: {
        schemas: {
          Base: {
            discriminator: {
              mapping: {
                demo: '#/components/schemas/Demo',
              },
            },
            properties: {
              nested: {
                $ref: '#/components/schemas/Demo',
              },
            },
            type: 'object',
          },
          Demo: {
            type: 'object',
          },
          NoContext: {
            properties: {
              value: {
                $ref: '#/components/schemas/Demo',
              },
            },
            type: 'object',
          },
        },
      },
      openapi: '3.1.0',
      paths: {
        '/demo': {
          post: {
            operationId: 'createDemo',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Base',
                  },
                },
              },
            },
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Demo',
                    },
                  },
                },
                description: 'ok',
              },
            },
          },
        },
      },
    };

    updateRefsInSpec({
      logger: createLogger(),
      spec,
      split: {
        mapping: {
          '#/components/schemas/Demo': {
            read: '#/components/schemas/DemoRead',
          },
        },
        reverseMapping: {},
      },
    });

    expect(spec.paths['/demo'].post.requestBody.content['application/json'].schema.$ref).toBe(
      '#/components/schemas/Base',
    );
    expect(spec.paths['/demo'].post.responses[200].content['application/json'].schema.$ref).toBe(
      '#/components/schemas/DemoRead',
    );
    expect(spec.components.schemas.NoContext.properties.value.$ref).toBe(
      '#/components/schemas/DemoRead',
    );
    expect(spec.components.schemas.Base.properties.nested.$ref).toBe(
      '#/components/schemas/DemoRead',
    );
    expect(spec.components.schemas.Base.discriminator.mapping.demo).toBe(
      '#/components/schemas/DemoRead',
    );
  });

  it('falls back to write variant when read variant is missing', () => {
    const spec: any = {
      components: {
        schemas: {
          Demo: {
            type: 'object',
          },
          NoContext: {
            properties: {
              value: {
                $ref: '#/components/schemas/Demo',
              },
            },
            type: 'object',
          },
        },
      },
      openapi: '3.1.0',
      paths: {
        '/demo': {
          get: {
            operationId: 'getDemo',
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Demo',
                    },
                  },
                },
                description: 'ok',
              },
            },
          },
          post: {
            operationId: 'createDemo',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Demo',
                  },
                },
              },
            },
            responses: {
              204: {
                description: 'created',
              },
            },
          },
        },
      },
    };

    updateRefsInSpec({
      logger: createLogger(),
      spec,
      split: {
        mapping: {
          '#/components/schemas/Demo': {
            write: '#/components/schemas/DemoWrite',
          },
        },
        reverseMapping: {},
      },
    });

    expect(spec.paths['/demo'].get.responses[200].content['application/json'].schema.$ref).toBe(
      '#/components/schemas/DemoWrite',
    );
    expect(spec.paths['/demo'].post.requestBody.content['application/json'].schema.$ref).toBe(
      '#/components/schemas/DemoWrite',
    );
    expect(spec.components.schemas.NoContext.properties.value.$ref).toBe(
      '#/components/schemas/DemoWrite',
    );
  });
});
