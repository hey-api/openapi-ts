import { describe, expect, it, vi } from 'vitest';

import type { OpenApi } from '../openApi/types';
import { patchSchemas } from '../patchSchemas';

describe('patchSchemas', () => {
  describe('edge cases', () => {
    it('should return early when data is null', () => {
      const fixFn = vi.fn();

      patchSchemas({
        data: null,
        patch: {
          schemas: {
            TestSchema: fixFn,
          },
        },
      });

      expect(fixFn).not.toHaveBeenCalled();
    });

    it('should return early when data is undefined', () => {
      const fixFn = vi.fn();

      patchSchemas({
        data: undefined,
        patch: {
          schemas: {
            TestSchema: fixFn,
          },
        },
      });

      expect(fixFn).not.toHaveBeenCalled();
    });

    it('should return early when fix is undefined', () => {
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            TestSchema: {
              properties: {
                id: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({ data: mockSpec });

      expect(mockSpec.components?.schemas?.TestSchema).toEqual({
        properties: {
          id: { type: 'string' },
        },
        type: 'object',
      });
    });

    it('should return early when fix.schema is undefined', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            TestSchema: {
              properties: {
                id: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {},
      });

      expect(fixFn).not.toHaveBeenCalled();
    });
  });

  describe('OpenAPI v3 schema fixing', () => {
    it('should apply fix function to matching schema in components.schemas', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            TestSchema: {
              properties: {
                id: { type: 'string' },
                updatedAt: { format: 'date-time', type: 'string' },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestSchema: fixFn,
          },
        },
      });

      expect(fixFn).toHaveBeenCalledWith({
        properties: {
          id: { type: 'string' },
          updatedAt: { format: 'date-time', type: 'string' },
        },
        type: 'object',
      });
    });

    it('should mutate schema object when fix function modifies it', () => {
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            TestSchema: {
              properties: {
                id: { type: 'string' },
                updatedAt: { format: 'date-time', type: 'string' },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestSchema: (schema: any) => {
              if (schema.properties?.updatedAt) {
                delete schema.properties.updatedAt.format;
                schema.properties.updatedAt.type = 'number';
              }
            },
          },
        },
      });

      expect(mockSpec.components?.schemas?.TestSchema).toEqual({
        properties: {
          id: { type: 'string' },
          updatedAt: { type: 'number' },
        },
        type: 'object',
      });
    });

    it('should apply multiple fix functions to different schemas', () => {
      const fixFn1 = vi.fn();
      const fixFn2 = vi.fn();
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            ProductSchema: {
              properties: { name: { type: 'string' } },
              type: 'object',
            },
            UserSchema: {
              properties: { id: { type: 'string' } },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            ProductSchema: fixFn2,
            UserSchema: fixFn1,
          },
        },
      });

      expect(fixFn1).toHaveBeenCalledWith({
        properties: { id: { type: 'string' } },
        type: 'object',
      });
      expect(fixFn2).toHaveBeenCalledWith({
        properties: { name: { type: 'string' } },
        type: 'object',
      });
    });

    it('should skip schemas that do not have matching fix functions', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            TestSchema: {
              properties: { id: { type: 'string' } },
              type: 'object',
            },
            UnmatchedSchema: {
              properties: { name: { type: 'string' } },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestSchema: fixFn,
          },
        },
      });

      expect(fixFn).toHaveBeenCalledOnce();
      expect(fixFn).toHaveBeenCalledWith({
        properties: { id: { type: 'string' } },
        type: 'object',
      });
    });

    it('should handle spec without components', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V3_1_X = {
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestSchema: fixFn,
          },
        },
      });

      expect(fixFn).not.toHaveBeenCalled();
    });

    it('should handle spec with components but no schemas', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V3_1_X = {
        components: {},
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestSchema: fixFn,
          },
        },
      });

      expect(fixFn).not.toHaveBeenCalled();
    });

    it('should skip non-object schema values', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            NumberSchema: 123 as any,
            StringSchema: 'invalid' as any,
            TestSchema: null as any,
            ValidSchema: {
              properties: { id: { type: 'string' } },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            NumberSchema: fixFn,
            StringSchema: fixFn,
            TestSchema: fixFn,
            ValidSchema: fixFn,
          },
        },
      });

      expect(fixFn).toHaveBeenCalledOnce();
      expect(fixFn).toHaveBeenCalledWith({
        properties: { id: { type: 'string' } },
        type: 'object',
      });
    });
  });

  describe('OpenAPI v2 (Swagger) schema fixing', () => {
    it('should apply fix function to matching schema in definitions', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V2_0_X = {
        definitions: {
          TestModel: {
            properties: {
              createdAt: { format: 'date-time', type: 'string' },
              id: { type: 'string' },
            },
            type: 'object',
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        swagger: '2.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestModel: fixFn,
          },
        },
      });

      expect(fixFn).toHaveBeenCalledWith({
        properties: {
          createdAt: { format: 'date-time', type: 'string' },
          id: { type: 'string' },
        },
        type: 'object',
      });
    });

    it('should mutate schema object in Swagger v2 spec', () => {
      const mockSpec: OpenApi.V2_0_X = {
        definitions: {
          TestModel: {
            properties: {
              id: { type: 'string' },
              timestamp: { format: 'date-time', type: 'string' },
            },
            type: 'object',
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        swagger: '2.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestModel: (schema: any) => {
              if (schema.properties?.timestamp) {
                delete schema.properties.timestamp.format;
                schema.properties.timestamp.type = 'integer';
              }
            },
          },
        },
      });

      expect(mockSpec.definitions?.TestModel).toEqual({
        properties: {
          id: { type: 'string' },
          timestamp: { type: 'integer' },
        },
        type: 'object',
      });
    });

    it('should handle Swagger spec without definitions', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V2_0_X = {
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        swagger: '2.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            TestModel: fixFn,
          },
        },
      });

      expect(fixFn).not.toHaveBeenCalled();
    });

    it('should apply multiple fix functions in Swagger v2', () => {
      const fixFn1 = vi.fn();
      const fixFn2 = vi.fn();
      const mockSpec: OpenApi.V2_0_X = {
        definitions: {
          Product: {
            properties: { name: { type: 'string' } },
            type: 'object',
          },
          User: {
            properties: { id: { type: 'string' } },
            type: 'object',
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        swagger: '2.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            Product: fixFn2,
            User: fixFn1,
          },
        },
      });

      expect(fixFn1).toHaveBeenCalledWith({
        properties: { id: { type: 'string' } },
        type: 'object',
      });
      expect(fixFn2).toHaveBeenCalledWith({
        properties: { name: { type: 'string' } },
        type: 'object',
      });
    });

    it('should skip non-object schema values in Swagger v2', () => {
      const fixFn = vi.fn();
      const mockSpec: OpenApi.V2_0_X = {
        definitions: {
          InvalidModel: null as any,
          StringModel: 'invalid' as any,
          ValidModel: {
            properties: { id: { type: 'string' } },
            type: 'object',
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        paths: {},
        swagger: '2.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            InvalidModel: fixFn,
            StringModel: fixFn,
            ValidModel: fixFn,
          },
        },
      });

      expect(fixFn).toHaveBeenCalledOnce();
      expect(fixFn).toHaveBeenCalledWith({
        properties: { id: { type: 'string' } },
        type: 'object',
      });
    });
  });

  describe('real-world usage scenarios', () => {
    it('should handle complex schema transformation like in config example', () => {
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            ChatAgentSkinItemAdminResponseDto: {
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
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            ChatAgentSkinItemAdminResponseDto: (schema: any) => {
              if (typeof schema.properties?.updatedAt === 'object') {
                delete schema.properties.updatedAt.format;
                schema.properties.updatedAt.type = 'number';
              }
            },
          },
        },
      });

      expect(
        mockSpec.components?.schemas?.ChatAgentSkinItemAdminResponseDto,
      ).toEqual({
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          updatedAt: {
            type: 'number',
          },
        },
        type: 'object',
      });
    });

    it('should handle adding new properties to schema', () => {
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            UserModel: {
              properties: {
                id: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            UserModel: (schema: any) => {
              schema.properties.metadata = {
                additionalProperties: true,
                type: 'object',
              };
              schema.required = ['id'];
            },
          },
        },
      });

      expect(mockSpec.components?.schemas?.UserModel).toEqual({
        properties: {
          id: { type: 'string' },
          metadata: {
            additionalProperties: true,
            type: 'object',
          },
        },
        required: ['id'],
        type: 'object',
      });
    });

    it('should handle removing properties from schema', () => {
      const mockSpec: OpenApi.V3_1_X = {
        components: {
          schemas: {
            UserModel: {
              properties: {
                id: { type: 'string' },
                internalField: { type: 'string' },
                publicField: { type: 'string' },
              },
              type: 'object',
            },
          },
        },
        info: { title: 'Test API', version: '1.0.0' },
        openapi: '3.1.0',
      };

      patchSchemas({
        data: mockSpec,
        patch: {
          schemas: {
            UserModel: (schema: any) => {
              delete schema.properties.internalField;
            },
          },
        },
      });

      expect(mockSpec.components?.schemas?.UserModel).toEqual({
        properties: {
          id: { type: 'string' },
          publicField: { type: 'string' },
        },
        type: 'object',
      });
    });
  });
});
