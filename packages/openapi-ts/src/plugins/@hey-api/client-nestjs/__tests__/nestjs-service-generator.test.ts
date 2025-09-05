import { describe, expect, it, vi } from 'vitest';

import {
  generateOperationMethod,
  generateOperationMethodName,
  generateOperationParameters,
  generateOperationResponseType,
  generateServiceClass,
  generateServices,
  groupOperationsByTags,
  processServiceGroups,
} from '../nestjs-service-generator';
import {
  createMockContextWithOperations,
  createMockOperations,
  createMockPlugin,
} from './test-helpers';

describe('nestjs-service-generator', () => {
  describe('generateOperationMethodName', () => {
    it('should use operationId when available', () => {
      const operation = {
        id: 'getAllPets',
        method: 'get' as const,
        operationId: 'getAllPets',
        path: '/pets',
      };

      const result = generateOperationMethodName(operation as any);
      expect(result).toBe('getAllPets');
    });

    it('should generate method name from method and path when no operationId', () => {
      const operation = {
        id: 'getPetsSearch',
        method: 'get' as const,
        path: '/pets/search',
      };

      const result = generateOperationMethodName(operation as any);
      expect(result).toBe('getPetsSearch');
    });

    it('should handle path parameters correctly', () => {
      const operation = {
        id: 'getPetsOwner',
        method: 'get' as const,
        path: '/pets/{petId}/owner/{ownerId}',
      };

      const result = generateOperationMethodName(operation as any);
      expect(result).toBe('getPetsOwner');
    });

    it('should handle single word paths', () => {
      const operation = {
        id: 'postPets',
        method: 'post' as const,
        path: '/pets',
      };

      const result = generateOperationMethodName(operation as any);
      expect(result).toBe('postPets');
    });

    it('should handle root path', () => {
      const operation = {
        id: 'get',
        method: 'get' as const,
        path: '/',
      };

      const result = generateOperationMethodName(operation as any);
      expect(result).toBe('get');
    });

    it('should convert operationId to camelCase', () => {
      const operation = {
        id: 'getAllPets',
        method: 'get' as const,
        operationId: 'GetAllPets',
        path: '/pets',
      };

      const result = generateOperationMethodName(operation as any);
      expect(result).toBe('getAllPets');
    });
  });

  describe('generateOperationParameters', () => {
    it('should generate parameters for operation with path params', () => {
      const operation = {
        id: 'getPetById',
        method: 'get' as const,
        parameters: {
          path: {
            petId: {
              required: true,
              schema: { type: 'integer' },
            },
          },
        },
        path: '/pets/{petId}',
      };

      const result = generateOperationParameters(operation as any);
      expect(result).toBe('{ petId: number }');
    });

    it('should generate parameters for operation with query params', () => {
      const operation = {
        id: 'getPets',
        method: 'get' as const,
        parameters: {
          query: {
            limit: {
              required: false,
              schema: { type: 'integer' },
            },
            offset: {
              required: true,
              schema: { type: 'integer' },
            },
          },
        },
        path: '/pets',
      };

      const result = generateOperationParameters(operation as any);
      expect(result).toBe('{ limit?: number, offset: number }');
    });

    it('should generate parameters for operation with header params', () => {
      const operation = {
        id: 'getPetsWithAuth',
        method: 'get' as const,
        parameters: {
          header: {
            authorization: {
              required: true,
              schema: { type: 'string' },
            },
          },
        },
        path: '/pets',
      };

      const result = generateOperationParameters(operation as any);
      expect(result).toBe('{ authorization: string }');
    });

    it('should generate parameters for operation with body', () => {
      const operation = {
        body: {
          mediaType: 'application/json',
          required: true,
          schema: { type: 'object' as const },
        },
        id: 'createPet',
        method: 'post' as const,
        path: '/pets',
      };

      const result = generateOperationParameters(operation as any);
      expect(result).toBe('{ body: any }');
    });

    it('should generate parameters combining all types', () => {
      const operation = {
        body: {
          mediaType: 'application/json',
          required: false,
          schema: { type: 'object' as const },
        },
        id: 'updatePet',
        method: 'post' as const,
        parameters: {
          header: {
            contentType: {
              required: true,
              schema: { type: 'string' },
            },
          },
          path: {
            petId: {
              required: true,
              schema: { type: 'integer' },
            },
          },
          query: {
            include: {
              required: false,
              schema: { type: 'string' },
            },
          },
        },
        path: '/pets/{petId}',
      };

      const result = generateOperationParameters(operation as any);
      expect(result).toBe(
        '{ petId: number, include?: string, contentType: string, body?: any }',
      );
    });

    it('should return empty string for operation with no parameters', () => {
      const operation = {
        id: 'healthCheck',
        method: 'get' as const,
        path: '/health',
      };

      const result = generateOperationParameters(operation as any);
      expect(result).toBe('');
    });
  });

  describe('generateOperationResponseType', () => {
    it('should return generic response type', () => {
      const operation = {
        id: 'getPets',
        method: 'get' as const,
        path: '/pets',
      };

      const result = generateOperationResponseType(operation as any);
      expect(result).toBe('Promise<ApiResponse<any>>');
    });
  });

  describe('generateOperationMethod', () => {
    it('should generate method with parameters', () => {
      const operation = {
        id: 'getPetById',
        method: 'get' as const,
        operationId: 'getPetById',
        parameters: {
          path: {
            petId: {
              required: true,
              schema: { type: 'integer' },
            },
          },
        },
        path: '/pets/{petId}',
        summary: 'Get a pet by ID',
      };

      const result = generateOperationMethod(operation as any, 'Api');
      expect(result).toContain(
        'async getPetById(options: { petId: number }): Promise<ApiResponse<any>>',
      );
      expect(result).toContain('Get a pet by ID');
      expect(result).toContain("method: 'GET'");
      expect(result).toContain("url: '/pets/{petId}'");
    });

    it('should generate method without parameters', () => {
      const operation = {
        id: 'healthCheck',
        method: 'get' as const,
        operationId: 'healthCheck',
        path: '/health',
        summary: 'Health check endpoint',
      };

      const result = generateOperationMethod(operation as any, 'Api');
      expect(result).toContain(
        'async healthCheck(): Promise<ApiResponse<any>>',
      );
      expect(result).toContain('Health check endpoint');
      expect(result).toContain("method: 'GET'");
      expect(result).toContain("url: '/health'");
    });

    it('should handle deprecated operations', () => {
      const operation = {
        deprecated: true,
        id: 'legacyEndpoint',
        method: 'get' as const,
        operationId: 'legacyEndpoint',
        path: '/legacy',
        summary: 'Legacy endpoint',
      };

      const result = generateOperationMethod(operation as any, 'Api');
      expect(result).toContain(
        'async legacyEndpoint(): Promise<ApiResponse<any>>',
      );
      expect(result).toContain('@deprecated');
    });
  });

  describe('groupOperationsByTags', () => {
    it('should group operations by tags', () => {
      const operations = createMockOperations();

      const result = groupOperationsByTags(operations as any);

      expect(result.size).toBe(3);
      expect(result.has('pets')).toBe(true);
      expect(result.has('users')).toBe(true);
      expect(result.has('store')).toBe(true);

      const petsGroup = result.get('pets');
      expect(petsGroup?.operations).toHaveLength(3);
      expect(petsGroup?.tag).toBe('pets');
    });

    it('should handle operations without tags using default', () => {
      const operations = [
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

      const result = groupOperationsByTags(operations as any);

      expect(result.size).toBe(1);
      expect(result.has('default')).toBe(true);

      const defaultGroup = result.get('default');
      expect(defaultGroup?.operations).toHaveLength(1);
      expect(defaultGroup?.tag).toBe('default');
    });

    it('should handle operations with multiple tags', () => {
      const operations = [
        {
          method: 'get' as const,
          operation: {
            id: 'getPets',
            method: 'get' as const,
            operationId: 'getPets',
            path: '/pets',
            tags: ['pets', 'animals'],
          },
          path: '/pets',
        },
      ];

      const result = groupOperationsByTags(operations as any);

      expect(result.size).toBe(2);
      expect(result.has('pets')).toBe(true);
      expect(result.has('animals')).toBe(true);

      const petsGroup = result.get('pets');
      const animalsGroup = result.get('animals');
      expect(petsGroup?.operations).toHaveLength(1);
      expect(animalsGroup?.operations).toHaveLength(1);
    });
  });

  describe('processServiceGroups', () => {
    it('should apply naming conventions to service groups', () => {
      const groups = new Map([
        ['pets', { className: 'pets', operations: [], tag: 'pets' }],
        ['users', { className: 'users', operations: [], tag: 'users' }],
      ]);

      const result = processServiceGroups(groups, 'Api');

      expect(result.size).toBe(2);
      expect(result.get('pets')?.className).toBe('ApiPetsService');
      expect(result.get('users')?.className).toBe('ApiUsersService');
    });

    it('should handle special characters in tags', () => {
      const groups = new Map([
        [
          'pet-store',
          { className: 'pet-store', operations: [], tag: 'pet-store' },
        ],
        [
          'user_management',
          {
            className: 'user_management',
            operations: [],
            tag: 'user_management',
          },
        ],
      ]);

      const result = processServiceGroups(groups, 'MyApi');

      expect(result.size).toBe(2);
      expect(result.get('pet-store')?.className).toBe('MyApiPetStoreService');
      expect(result.get('user_management')?.className).toBe(
        'MyApiUserManagementService',
      );
    });
  });

  describe('generateServiceClass', () => {
    it('should generate service class with operations', () => {
      const group = {
        className: 'ApiPetsService',
        operations: [
          {
            method: 'get' as const,
            operation: {
              id: 'getPets',
              method: 'get' as const,
              operationId: 'getPets',
              path: '/pets',
              summary: 'List all pets',
            },
            path: '/pets',
          },
        ],
        tag: 'pets',
      };

      const result = generateServiceClass(group as any, 'Api');

      expect(result).toContain('export class ApiPetsService');
      expect(result).toContain("import { Injectable } from '@nestjs/common'");
      expect(result).toContain("import { ApiClient } from './api-client'");
      expect(result).toContain(
        'constructor(private readonly client: ApiClient)',
      );
      expect(result).toContain('async getPets()');
      expect(result).toContain('List all pets');
    });

    it('should handle empty operations', () => {
      const group = {
        className: 'ApiEmptyService',
        operations: [],
        tag: 'empty',
      };

      const result = generateServiceClass(group as any, 'Api');

      expect(result).toContain('export class ApiEmptyService');
      expect(result).toContain(
        'constructor(private readonly client: ApiClient)',
      );
    });
  });

  describe('generateServices', () => {
    it('should generate services from plugin operations', () => {
      const plugin = createMockPlugin(
        { clientName: 'TestApi' },
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

      const result = generateServices({ plugin });

      expect(plugin.forEach).toHaveBeenCalledWith(
        'operation',
        expect.any(Function),
      );
      expect(result.size).toBe(3); // pets, users, store
      expect(plugin.createFile).toHaveBeenCalledTimes(3); // One file per service group
    });

    it('should handle plugin with no operations', () => {
      const plugin = createMockPlugin({ clientName: 'EmptyApi' });

      // Mock forEach to not yield any operations
      plugin.forEach = vi.fn();

      const result = generateServices({ plugin });

      expect(plugin.forEach).toHaveBeenCalledWith(
        'operation',
        expect.any(Function),
      );
      expect(result.size).toBe(0);
      expect(plugin.createFile).not.toHaveBeenCalled();
    });

    it('should use custom client name', () => {
      const plugin = createMockPlugin(
        { clientName: 'CustomApiClient' },
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

      const result = generateServices({ plugin });

      expect(result.size).toBe(3);

      const petsGroup = result.get('pets');
      expect(petsGroup?.className).toBe('CustomApiClientPetsService');
    });
  });
});
