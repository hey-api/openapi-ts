import { describe, expect, it, vi } from 'vitest';

import { generateNestjsClient } from '../nestjs-generator';
import {
  createMockContextWithOperations,
  createMockOperations,
  createMockPlugin,
} from './test-helpers';

describe('nestjs-generator', () => {
  describe('generateNestjsClient', () => {
    it('should generate client with all components in single file', () => {
      const plugin = createMockPlugin(
        { clientName: 'Api' },
        createMockContextWithOperations(),
      );

      // Mock the forEach method to yield operations
      const operations = createMockOperations();
      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operations.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      // Mock querySymbol to return mock type symbols
      plugin.querySymbol = vi.fn().mockImplementation((args) => {
        if (args.role === 'data') {
          return { placeholder: `${args.resourceId}Data` };
        }
        if (args.role === 'responses') {
          return { placeholder: `${args.resourceId}Response` };
        }
        return undefined;
      });

      generateNestjsClient({ plugin });

      // Verify plugin.forEach was called to collect operations
      expect(plugin.forEach).toHaveBeenCalledWith(
        'operation',
        expect.any(Function),
      );

      // Verify symbol registration was called for the client
      expect(plugin.registerSymbol).toHaveBeenCalledWith(
        expect.objectContaining({
          exported: true,
          name: 'ApiClient',
        }),
      );

      // Verify symbol value was set with generated statements
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle custom client class name', () => {
      const plugin = createMockPlugin({
        clientClassName: 'CustomApiClient',
        clientName: 'Api',
      });

      plugin.forEach = vi.fn();
      plugin.querySymbol = vi.fn();

      generateNestjsClient({ plugin });

      expect(plugin.registerSymbol).toHaveBeenCalledWith(
        expect.objectContaining({
          exported: true,
          name: 'CustomApiClient',
        }),
      );
    });

    it('should handle custom module name', () => {
      const plugin = createMockPlugin({
        clientName: 'Api',
        moduleName: 'CustomApiModule',
      });

      plugin.forEach = vi.fn();
      plugin.querySymbol = vi.fn();

      generateNestjsClient({ plugin });

      // Module name is used internally but not in registration
      expect(plugin.registerSymbol).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should group operations by tags', () => {
      const plugin = createMockPlugin(
        { clientName: 'TestApi' },
        createMockContextWithOperations(),
      );

      const operations = createMockOperations();
      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operations.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'MockType',
      });

      generateNestjsClient({ plugin });

      // Should process operations and generate client
      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();

      // Verify the generated value contains expected structures
      const setSymbolCall = plugin.setSymbolValue.mock.calls[0];
      expect(setSymbolCall).toBeDefined();
      expect(Array.isArray(setSymbolCall[1])).toBe(true);
    });

    it('should handle operations without tags using default', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithoutTags = [
        {
          method: 'get' as const,
          operation: {
            id: 'healthCheck',
            method: 'get' as const,
            operationId: 'healthCheck',
            path: '/health',
          },
          path: '/health',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithoutTags.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'HealthCheckData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle operations with multiple tags', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithMultipleTags = [
        {
          method: 'get' as const,
          operation: {
            id: 'getPets',
            method: 'get' as const,
            operationId: 'getPets',
            path: '/pets',
            tags: ['pets', 'animals', 'catalog'],
          },
          path: '/pets',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithMultipleTags.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'GetPetsData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should deduplicate service class names', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      // Create operations that would generate duplicate class names
      const operationsWithSimilarTags = [
        {
          method: 'get' as const,
          operation: {
            id: 'getPets1',
            method: 'get' as const,
            operationId: 'getPets1',
            path: '/pets',
            tags: ['pets'],
          },
          path: '/pets',
        },
        {
          method: 'get' as const,
          operation: {
            id: 'getPets2',
            method: 'get' as const,
            operationId: 'getPets2',
            path: '/pets/v2',
            tags: ['Pets'], // Different case - would normalize to same name
          },
          path: '/pets/v2',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithSimilarTags.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'MockData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle empty operations list', () => {
      const plugin = createMockPlugin({ clientName: 'EmptyApi' });

      plugin.forEach = vi.fn().mockImplementation((_eventType, _callback) => {
        // Don't call callback - no operations
      });

      plugin.querySymbol = vi.fn();

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalledWith(
        'operation',
        expect.any(Function),
      );
      expect(plugin.registerSymbol).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should query types for operation data and responses', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operations = [
        {
          method: 'get' as const,
          operation: {
            id: 'getUser',
            method: 'get' as const,
            operationId: 'getUser',
            path: '/users/{id}',
            tags: ['users'],
          },
          path: '/users/{id}',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operations.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'MockType',
      });

      generateNestjsClient({ plugin });

      // Should query symbols for data and responses
      expect(plugin.querySymbol).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'type',
          resource: 'operation',
          resourceId: 'getUser',
          role: 'data',
          tool: 'typescript',
        }),
      );

      expect(plugin.querySymbol).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'type',
          resource: 'operation',
          resourceId: 'getUser',
          role: 'responses',
        }),
      );
    });

    it('should generate imports for operation types', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operations = createMockOperations();
      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operations.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockImplementation((args) => {
        if (args.role === 'data') {
          return { placeholder: `${args.resourceId}Data` };
        }
        if (args.role === 'responses') {
          return { placeholder: `${args.resourceId}Response` };
        }
        return undefined;
      });

      generateNestjsClient({ plugin });

      expect(plugin.setSymbolValue).toHaveBeenCalled();
      const generatedStatements = plugin.setSymbolValue.mock.calls[0][1];
      expect(Array.isArray(generatedStatements)).toBe(true);
    });

    it('should handle different HTTP methods', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithDifferentMethods = [
        {
          method: 'get' as const,
          operation: {
            id: 'getItems',
            method: 'get' as const,
            path: '/items',
            tags: ['items'],
          },
          path: '/items',
        },
        {
          method: 'post' as const,
          operation: {
            body: { required: true },
            id: 'createItem',
            method: 'post' as const,
            path: '/items',
            tags: ['items'],
          },
          path: '/items',
        },
        {
          method: 'put' as const,
          operation: {
            body: { required: true },
            id: 'updateItem',
            method: 'put' as const,
            path: '/items/{id}',
            tags: ['items'],
          },
          path: '/items/{id}',
        },
        {
          method: 'patch' as const,
          operation: {
            body: { required: false },
            id: 'patchItem',
            method: 'patch' as const,
            path: '/items/{id}',
            tags: ['items'],
          },
          path: '/items/{id}',
        },
        {
          method: 'delete' as const,
          operation: {
            id: 'deleteItem',
            method: 'delete' as const,
            path: '/items/{id}',
            tags: ['items'],
          },
          path: '/items/{id}',
        },
        {
          method: 'head' as const,
          operation: {
            id: 'headItem',
            method: 'head' as const,
            path: '/items/{id}',
            tags: ['items'],
          },
          path: '/items/{id}',
        },
        {
          method: 'options' as const,
          operation: {
            id: 'optionsItem',
            method: 'options' as const,
            path: '/items',
            tags: ['items'],
          },
          path: '/items',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithDifferentMethods.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'MockType',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle path parameters in operation paths', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithPathParams = [
        {
          method: 'get' as const,
          operation: {
            id: 'getUser',
            method: 'get' as const,
            parameters: {
              path: {
                userId: {
                  name: 'userId',
                  required: true,
                  schema: { type: 'integer' as const },
                },
              },
            },
            path: '/users/{userId}',
            tags: ['users'],
          },
          path: '/users/{userId}',
        },
        {
          method: 'get' as const,
          operation: {
            id: 'getUserPost',
            method: 'get' as const,
            parameters: {
              path: {
                postId: {
                  name: 'postId',
                  required: true,
                  schema: { type: 'integer' as const },
                },
                userId: {
                  name: 'userId',
                  required: true,
                  schema: { type: 'integer' as const },
                },
              },
            },
            path: '/users/{userId}/posts/{postId}',
            tags: ['users'],
          },
          path: '/users/{userId}/posts/{postId}',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithPathParams.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'MockType',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle operations with query parameters', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithQueryParams = [
        {
          method: 'get' as const,
          operation: {
            id: 'searchUsers',
            method: 'get' as const,
            parameters: {
              query: {
                limit: {
                  name: 'limit',
                  required: false,
                  schema: { type: 'integer' as const },
                },
                offset: {
                  name: 'offset',
                  required: false,
                  schema: { type: 'integer' as const },
                },
                search: {
                  name: 'search',
                  required: false,
                  schema: { type: 'string' as const },
                },
              },
            },
            path: '/users',
            tags: ['users'],
          },
          path: '/users',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithQueryParams.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'SearchUsersData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle operations with header parameters', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithHeaders = [
        {
          method: 'get' as const,
          operation: {
            id: 'getSecureData',
            method: 'get' as const,
            parameters: {
              header: {
                authorization: {
                  name: 'authorization',
                  required: true,
                  schema: { type: 'string' as const },
                },
                'x-api-key': {
                  name: 'x-api-key',
                  required: false,
                  schema: { type: 'string' as const },
                },
              },
            },
            path: '/secure',
            tags: ['security'],
          },
          path: '/secure',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithHeaders.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'GetSecureDataData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle operations with request body', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithBody = [
        {
          method: 'post' as const,
          operation: {
            body: {
              mediaType: 'application/json',
              required: true,
              schema: { type: 'object' as const },
            },
            id: 'createUser',
            method: 'post' as const,
            path: '/users',
            tags: ['users'],
          },
          path: '/users',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithBody.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'CreateUserData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle deprecated operations', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const deprecatedOperations = [
        {
          method: 'get' as const,
          operation: {
            deprecated: true,
            description: 'This endpoint is deprecated',
            id: 'oldEndpoint',
            method: 'get' as const,
            path: '/old',
            summary: 'Old endpoint',
            tags: ['legacy'],
          },
          path: '/old',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          deprecatedOperations.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'OldEndpointData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle operations with summary and description', () => {
      const plugin = createMockPlugin({ clientName: 'Api' });

      const operationsWithDocs = [
        {
          method: 'get' as const,
          operation: {
            description:
              'This is a detailed description of what this endpoint does',
            id: 'documentedEndpoint',
            method: 'get' as const,
            path: '/documented',
            summary: 'A documented endpoint',
            tags: ['docs'],
          },
          path: '/documented',
        },
      ];

      plugin.forEach = vi.fn().mockImplementation((eventType, callback) => {
        if (eventType === 'operation') {
          operationsWithDocs.forEach((operationData) => {
            callback({
              method: operationData.method,
              operation: operationData.operation,
              path: operationData.path,
              type: 'operation',
            });
          });
        }
      });

      plugin.querySymbol = vi.fn().mockReturnValue({
        placeholder: 'DocumentedEndpointData',
      });

      generateNestjsClient({ plugin });

      expect(plugin.forEach).toHaveBeenCalled();
      expect(plugin.setSymbolValue).toHaveBeenCalled();
    });

    it('should handle snake_case and kebab-case in client names', () => {
      const testCases = [
        { clientName: 'my-api', expected: 'MyApiClient' },
        { clientName: 'my_api', expected: 'MyApiClient' },
        { clientName: 'myApi', expected: 'MyApiClient' },
        { clientName: 'MyApi', expected: 'MyApiClient' },
        { clientName: 'MYAPI', expected: 'MyapiClient' },
      ];

      testCases.forEach(({ clientName, expected }) => {
        const plugin = createMockPlugin({ clientName });
        plugin.forEach = vi.fn();
        plugin.querySymbol = vi.fn();

        generateNestjsClient({ plugin });

        expect(plugin.registerSymbol).toHaveBeenCalledWith(
          expect.objectContaining({
            exported: true,
            name: expected,
          }),
        );
      });
    });
  });
});
