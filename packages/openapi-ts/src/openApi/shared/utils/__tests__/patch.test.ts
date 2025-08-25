import { describe, expect, it, vi } from 'vitest';

import type { OpenApi } from '../../../../openApi/types';
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
