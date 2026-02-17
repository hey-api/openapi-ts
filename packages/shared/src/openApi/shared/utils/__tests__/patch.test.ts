import type { OpenApi } from '../../../types';
import { patchOpenApiSpec } from '../patch';

const specMetadataV2: Pick<OpenApi.V2_0_X, 'info' | 'paths' | 'swagger'> = {
  info: {
    title: 'Test API',
    version: '1.0.0',
  },
  paths: {},
  swagger: '2.0',
};

const specMetadataV3: Pick<OpenApi.V3_1_X, 'info' | 'openapi'> = {
  info: {
    title: 'Test API',
    version: '1.0.0',
  },
  openapi: '3.1.0',
};

describe('patchOpenApiSpec', () => {
  describe('patch.input', () => {
    describe('OpenAPI v3', () => {
      it('calls patch.input function before other patches', () => {
        const inputFn = vi.fn();
        const metaFn = vi.fn();
        const spec: OpenApi.V3_1_X = {
          ...specMetadataV3,
        };

        patchOpenApiSpec({
          patchOptions: {
            input: inputFn,
            meta: metaFn,
          },
          spec,
        });

        // Both should be called
        expect(inputFn).toHaveBeenCalledOnce();
        expect(inputFn).toHaveBeenCalledWith(spec);
        expect(metaFn).toHaveBeenCalledOnce();
      });

      it('allows bulk creation of component parameters', () => {
        const spec: OpenApi.V3_1_X = {
          ...specMetadataV3,
          paths: {},
        };

        patchOpenApiSpec({
          patchOptions: {
            input: (spec) => {
              if ('openapi' in spec) {
                if (!spec.components) spec.components = {};
                if (!spec.components.parameters) spec.components.parameters = {};
                spec.components.parameters.MyParam = {
                  in: 'query',
                  name: 'myParam',
                  schema: { type: 'string' },
                } as any;
              }
            },
          },
          spec,
        });

        expect(spec.components?.parameters?.MyParam).toEqual({
          in: 'query',
          name: 'myParam',
          schema: { type: 'string' },
        });
      });

      it('allows injecting parameters into multiple operations', () => {
        const spec: OpenApi.V3_1_X = {
          ...specMetadataV3,
          components: {
            parameters: {
              SharedParam: {
                in: 'query',
                name: 'shared',
                schema: { type: 'string' },
              } as any,
            },
          },
          paths: {
            '/bar': {
              get: {
                responses: {},
              },
            },
            '/baz': {
              post: {
                responses: {},
              },
            },
            '/foo': {
              get: {
                responses: {},
              },
            },
          } as any,
        };

        patchOpenApiSpec({
          patchOptions: {
            input: (spec) => {
              // Inject parameter into all GET operations
              for (const [, pathItem] of Object.entries(spec.paths ?? {})) {
                if (pathItem?.get) {
                  if (!Array.isArray(pathItem.get.parameters)) {
                    pathItem.get.parameters = [];
                  }
                  (pathItem.get.parameters as any[]).push({
                    $ref: '#/components/parameters/SharedParam',
                  });
                }
              }
            },
          },
          spec,
        });

        expect((spec.paths as any)['/foo'].get.parameters).toEqual([
          { $ref: '#/components/parameters/SharedParam' },
        ]);
        expect((spec.paths as any)['/bar'].get.parameters).toEqual([
          { $ref: '#/components/parameters/SharedParam' },
        ]);
        expect((spec.paths as any)['/baz'].post.parameters).toBeUndefined();
      });

      it('allows complex Redfish-like transformations', () => {
        const spec: OpenApi.V3_1_X = {
          ...specMetadataV3,
          paths: {
            '/other/path': {
              get: {
                responses: {},
              },
            },
            '/redfish/v1/Chassis': {
              get: {
                responses: {},
              },
            },
            '/redfish/v1/Systems': {
              get: {
                responses: {},
              },
            },
          } as any,
        };

        const QUERY_PARAMS = [
          { description: 'Expand related resources.', key: '$expand' },
          { description: 'Select subset.', key: '$select' },
        ];

        patchOpenApiSpec({
          patchOptions: {
            input: (spec) => {
              if (!('openapi' in spec)) return;

              // 1. Create component parameters
              if (!spec.components) spec.components = {};
              if (!spec.components.parameters) spec.components.parameters = {};

              for (const param of QUERY_PARAMS) {
                (spec.components.parameters as any)[`Redfish_${param.key}`] = {
                  description: param.description,
                  in: 'query',
                  name: param.key,
                  required: false,
                  schema: { type: 'string' },
                };
              }

              // 2. Inject into Redfish paths
              for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
                if (!path.startsWith('/redfish/v1')) continue;
                const getOp = pathItem?.get;
                if (!getOp) continue;

                if (!Array.isArray(getOp.parameters)) getOp.parameters = [];
                for (const param of QUERY_PARAMS) {
                  (getOp.parameters as any[]).push({
                    $ref: `#/components/parameters/Redfish_${param.key}`,
                  });
                }
              }
            },
          },
          spec,
        });

        // Verify component parameters were created
        expect(spec.components?.parameters).toHaveProperty('Redfish_$expand');
        expect(spec.components?.parameters).toHaveProperty('Redfish_$select');

        // Verify they were injected into Redfish paths
        expect((spec.paths as any)['/redfish/v1/Systems'].get.parameters).toHaveLength(2);
        expect((spec.paths as any)['/redfish/v1/Chassis'].get.parameters).toHaveLength(2);

        // Verify they were NOT injected into non-Redfish paths
        expect((spec.paths as any)['/other/path'].get.parameters).toBeUndefined();
      });
    });

    describe('OpenAPI v2', () => {
      it('calls patch.input function for v2 specs', () => {
        const inputFn = vi.fn();
        const spec: OpenApi.V2_0_X = {
          ...specMetadataV2,
        };

        patchOpenApiSpec({
          patchOptions: {
            input: inputFn,
          },
          spec,
        });

        expect(inputFn).toHaveBeenCalledOnce();
        expect(inputFn).toHaveBeenCalledWith(spec);
      });

      it('allows adding definitions in v2 specs', () => {
        const spec: OpenApi.V2_0_X = {
          ...specMetadataV2,
        };

        patchOpenApiSpec({
          patchOptions: {
            input: (spec) => {
              if ('swagger' in spec) {
                if (!spec.definitions) spec.definitions = {};
                spec.definitions.NewSchema = {
                  properties: {
                    id: { type: 'string' },
                  },
                  type: 'object',
                } as any;
              }
            },
          },
          spec,
        });

        expect(spec.definitions?.NewSchema).toEqual({
          properties: {
            id: { type: 'string' },
          },
          type: 'object',
        });
      });
    });
  });

  describe('shorthand patch function', () => {
    describe('OpenAPI v3', () => {
      it('calls shorthand patch function', () => {
        const patchFn = vi.fn();
        const spec: OpenApi.V3_1_X = {
          ...specMetadataV3,
        };

        patchOpenApiSpec({
          patchOptions: patchFn,
          spec,
        });

        expect(patchFn).toHaveBeenCalledOnce();
        expect(patchFn).toHaveBeenCalledWith(spec);
      });

      it('allows modifications through shorthand function', () => {
        const spec: OpenApi.V3_1_X = {
          ...specMetadataV3,
        };

        patchOpenApiSpec({
          patchOptions: (spec) => {
            spec.info.title = 'Modified Title';
          },
          spec,
        });

        expect(spec.info.title).toBe('Modified Title');
      });

      it('shorthand function prevents other patches from running', () => {
        const spec: OpenApi.V3_1_X = {
          ...specMetadataV3,
        };

        patchOpenApiSpec({
          patchOptions: (spec) => {
            spec.info.title = 'Shorthand Title';
          },
          spec,
        });

        expect(spec.info.title).toBe('Shorthand Title');
      });
    });

    describe('OpenAPI v2', () => {
      it('calls shorthand patch function for v2 specs', () => {
        const patchFn = vi.fn();
        const spec: OpenApi.V2_0_X = {
          ...specMetadataV2,
        };

        patchOpenApiSpec({
          patchOptions: patchFn,
          spec,
        });

        expect(patchFn).toHaveBeenCalledOnce();
        expect(patchFn).toHaveBeenCalledWith(spec);
      });

      it('allows modifications through shorthand function in v2', () => {
        const spec: OpenApi.V2_0_X = {
          ...specMetadataV2,
        };

        patchOpenApiSpec({
          patchOptions: (spec) => {
            spec.info.title = 'Modified V2 Title';
          },
          spec,
        });

        expect(spec.info.title).toBe('Modified V2 Title');
      });
    });
  });

  describe('edge cases', () => {
    it('does not modify spec', () => {
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              type: 'string',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: undefined,
        spec,
      });

      expect(spec).toEqual({
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              type: 'string',
            },
          },
        },
      });
    });

    it('does not modify spec', () => {
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              type: 'string',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {},
        spec,
      });

      expect(spec).toEqual({
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              type: 'string',
            },
          },
        },
      });
    });
  });

  describe('OpenAPI v3', () => {
    it('calls patch function', () => {
      const fnBar = vi.fn();
      const fnFoo = vi.fn();

      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          schemas: {
            Bar: {
              type: 'object',
            },
            Foo: {
              type: 'string',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Bar: fnBar,
            Foo: fnFoo,
          },
        },
        spec,
      });

      expect(fnBar).toHaveBeenCalledOnce();
      expect(fnBar).toHaveBeenCalledWith({
        type: 'object',
      });
      expect(fnFoo).toHaveBeenCalledOnce();
      expect(fnFoo).toHaveBeenCalledWith({
        type: 'string',
      });
    });

    it('patch function mutates spec', () => {
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          parameters: {
            Foo: {
              in: 'path',
              name: 'foo',
              schema: {
                type: 'string',
              },
            },
          },
          requestBodies: {
            Foo: {
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
          },
          responses: {
            Foo: {
              $ref: 'foo',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
          },
          schemas: {
            Foo: {
              type: 'string',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          parameters: {
            Foo: (schema) => {
              if ('in' in schema) {
                schema.in = 'query';
                if (schema.schema && 'type' in schema.schema) {
                  schema.schema.type = 'number';
                }
              }
            },
          },
          requestBodies: {
            Foo: (schema) => {
              if ('content' in schema) {
                if (
                  schema.content['application/json'] &&
                  schema.content['application/json'].schema
                ) {
                  if ('type' in schema.content['application/json'].schema) {
                    schema.content['application/json'].schema.type = 'number';
                  }
                }
              }
            },
          },
          responses: {
            Foo: (schema) => {
              if ('content' in schema) {
                if (
                  schema.content &&
                  schema.content['application/json'] &&
                  schema.content['application/json'].schema
                ) {
                  if ('type' in schema.content['application/json'].schema) {
                    schema.content['application/json'].schema.type = 'number';
                  }
                }
              }
            },
          },
          schemas: {
            Foo: (schema) => {
              schema.type = 'number';
            },
          },
        },
        spec,
      });

      expect(spec).toEqual({
        ...specMetadataV3,
        components: {
          parameters: {
            Foo: {
              in: 'query',
              name: 'foo',
              schema: {
                type: 'number',
              },
            },
          },
          requestBodies: {
            Foo: {
              content: {
                'application/json': {
                  schema: {
                    type: 'number',
                  },
                },
              },
            },
          },
          responses: {
            Foo: {
              $ref: 'foo',
              content: {
                'application/json': {
                  schema: {
                    type: 'number',
                  },
                },
              },
            },
          },
          schemas: {
            Foo: {
              type: 'number',
            },
          },
        },
      });
    });

    it('handles spec without components', () => {
      const fn = vi.fn();

      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
      };

      patchOpenApiSpec({
        patchOptions: {
          parameters: {
            Foo: fn,
          },
          requestBodies: {
            Foo: fn,
          },
          responses: {
            Foo: fn,
          },
          schemas: {
            Foo: fn,
          },
        },
        spec,
      });

      expect(fn).not.toHaveBeenCalled();
    });

    it('handles spec without component namespaces', () => {
      const fn = vi.fn();

      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {},
      };

      patchOpenApiSpec({
        patchOptions: {
          parameters: {
            Foo: fn,
          },
          requestBodies: {
            Foo: fn,
          },
          responses: {
            Foo: fn,
          },
          schemas: {
            Foo: fn,
          },
        },
        spec,
      });

      expect(fn).not.toHaveBeenCalled();
    });

    it('handles spec without matching components', () => {
      const fn = vi.fn();

      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          parameters: {},
          requestBodies: {},
          responses: {},
          schemas: {},
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          parameters: {
            Foo: fn,
          },
          requestBodies: {
            Foo: fn,
          },
          responses: {
            Foo: fn,
          },
          schemas: {
            Foo: fn,
          },
        },
        spec,
      });

      expect(fn).not.toHaveBeenCalled();
    });

    it('skips invalid schemas', () => {
      const fn = vi.fn();

      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          schemas: {
            Bar: 123 as any,
            Baz: 'invalid' as any,
            Foo: null as any,
            Qux: {
              type: 'string',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Bar: fn,
            Baz: fn,
            Foo: fn,
            Qux: fn,
          },
        },
        spec,
      });

      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith({
        type: 'string',
      });
    });

    it('applies meta patch function', () => {
      const metaFn = vi.fn((meta) => {
        meta.title = 'Changed Title';
      });
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
      };
      patchOpenApiSpec({
        patchOptions: {
          meta: metaFn,
        },
        spec,
      });
      expect(metaFn).toHaveBeenCalledOnce();
      expect(spec.info.title).toBe('Changed Title');
    });

    it('applies version patch function', () => {
      const versionFn = vi.fn((version) => `patched-${version}`);
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
      };
      patchOpenApiSpec({
        patchOptions: {
          version: versionFn,
        },
        spec,
      });
      expect(versionFn).toHaveBeenCalledOnce();
      expect(spec.openapi).toBe('patched-3.1.0');
    });
  });

  describe('OpenAPI v2', () => {
    it('calls patch function', () => {
      const fnBar = vi.fn();
      const fnFoo = vi.fn();

      const spec: OpenApi.V2_0_X = {
        ...specMetadataV2,
        definitions: {
          Bar: {
            type: 'object',
          },
          Foo: {
            type: 'string',
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Bar: fnBar,
            Foo: fnFoo,
          },
        },
        spec,
      });

      expect(fnBar).toHaveBeenCalledOnce();
      expect(fnBar).toHaveBeenCalledWith({
        type: 'object',
      });
      expect(fnFoo).toHaveBeenCalledOnce();
      expect(fnFoo).toHaveBeenCalledWith({
        type: 'string',
      });
    });

    it('patch function mutates schema', () => {
      const spec: OpenApi.V2_0_X = {
        ...specMetadataV2,
        definitions: {
          Foo: {
            type: 'string',
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Foo: (schema) => {
              schema.type = 'number';
            },
          },
        },
        spec,
      });

      expect(spec).toEqual({
        ...specMetadataV2,
        definitions: {
          Foo: {
            type: 'number',
          },
        },
      });
    });

    it('handles spec without definitions', () => {
      const fn = vi.fn();

      const spec: OpenApi.V2_0_X = {
        ...specMetadataV2,
      };

      patchOpenApiSpec({
        patchOptions: {
          parameters: {
            Foo: fn,
          },
          requestBodies: {
            Foo: fn,
          },
          responses: {
            Foo: fn,
          },
          schemas: {
            Foo: fn,
          },
        },
        spec,
      });

      expect(fn).not.toHaveBeenCalled();
    });

    it('handles spec without matching definitions', () => {
      const fn = vi.fn();

      const spec: OpenApi.V2_0_X = {
        ...specMetadataV2,
        definitions: {},
      };

      patchOpenApiSpec({
        patchOptions: {
          parameters: {
            Foo: fn,
          },
          requestBodies: {
            Foo: fn,
          },
          responses: {
            Foo: fn,
          },
          schemas: {
            Foo: fn,
          },
        },
        spec,
      });

      expect(fn).not.toHaveBeenCalled();
    });

    it('skips invalid schemas', () => {
      const fn = vi.fn();

      const spec: OpenApi.V2_0_X = {
        ...specMetadataV2,
        definitions: {
          Bar: 123 as any,
          Baz: 'invalid' as any,
          Foo: null as any,
          Qux: {
            type: 'string',
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Bar: fn,
            Baz: fn,
            Foo: fn,
            Qux: fn,
          },
        },
        spec,
      });

      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith({
        type: 'string',
      });
    });

    it('applies meta patch function', () => {
      const metaFn = vi.fn((meta) => {
        meta.title = 'Changed Title';
      });
      const spec: OpenApi.V2_0_X = {
        ...specMetadataV2,
      };
      patchOpenApiSpec({
        patchOptions: {
          meta: metaFn,
        },
        spec,
      });
      expect(metaFn).toHaveBeenCalledOnce();
      expect(spec.info.title).toBe('Changed Title');
    });

    it('applies version patch function', () => {
      const versionFn = vi.fn((version) => `patched-${version}`);
      const spec: OpenApi.V2_0_X = {
        ...specMetadataV2,
      };
      patchOpenApiSpec({
        patchOptions: {
          version: versionFn,
        },
        spec,
      });
      expect(versionFn).toHaveBeenCalledOnce();
      expect(spec.swagger).toBe('patched-2.0');
    });
  });

  describe('real-world usage', () => {
    it('handles complex schema example from docs', () => {
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                updatedAt: {
                  format: 'date-time',
                  type: 'string',
                },
              },
              type: 'object',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Foo: (schema: any) => {
              if (typeof schema.properties?.updatedAt === 'object') {
                delete schema.properties.updatedAt.format;
                schema.properties.updatedAt.type = 'number';
              }
            },
          },
        },
        spec,
      });

      expect(spec).toEqual({
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                updatedAt: {
                  type: 'number',
                },
              },
              type: 'object',
            },
          },
        },
      });
    });

    it('handles adding new schema properties', () => {
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              properties: {
                id: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Foo: (schema: any) => {
              schema.properties.meta = {
                additionalProperties: true,
                type: 'object',
              };
              schema.required = ['meta'];
            },
          },
        },
        spec,
      });

      expect(spec).toEqual({
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              properties: {
                id: { type: 'string' },
                meta: {
                  additionalProperties: true,
                  type: 'object',
                },
              },
              required: ['meta'],
              type: 'object',
            },
          },
        },
      });
    });

    it('handles removing schema properties', () => {
      const spec: OpenApi.V3_1_X = {
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              properties: {
                id: { type: 'string' },
                internalField: { type: 'string' },
                publicField: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
      };

      patchOpenApiSpec({
        patchOptions: {
          schemas: {
            Foo: (schema: any) => {
              delete schema.properties.internalField;
            },
          },
        },
        spec,
      });

      expect(spec).toEqual({
        ...specMetadataV3,
        components: {
          schemas: {
            Foo: {
              properties: {
                id: { type: 'string' },
                publicField: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
      });
    });
  });
});
