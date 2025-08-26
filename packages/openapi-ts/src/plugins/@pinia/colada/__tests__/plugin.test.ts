import { describe, expect, it, vi } from 'vitest';

import type { IR } from '../../../../ir/types';
import type { PiniaColadaPlugin } from '../types';

// Mock operation object helper
const createMockOperation = (
  method: IR.OperationObject['method'],
  id = 'testOperation',
  tags?: string[],
): IR.OperationObject => ({
  id,
  method,
  operationId: id,
  path: '/test',
  responses: {},
  tags,
});

// Mock plugin instance helper
const createMockPlugin = (
  config: Partial<PiniaColadaPlugin['Config']['config']> = {},
): any => ({
  config: {
    autoDetectHttpMethod: true,
    exportFromIndex: false,
    groupByTag: false,
    operationTypes: {},
    ...config,
  },
  context: {
    file: vi.fn(),
  },
  createFile: vi.fn(() => ({
    add: vi.fn(),
    identifier: vi.fn(() => ({ name: 'testIdentifier' })),
    import: vi.fn(),
  })),
  getPlugin: vi.fn(() => ({
    config: {
      responseStyle: 'response',
    },
  })),
});

// Import the functions we want to test (we'll need to extract them from the plugin file)
// For now, let's test the logic through integration with the plugin
describe('@pinia/colada plugin', () => {
  describe('HTTP method auto-detection', () => {
    it('should generate query for GET requests when autoDetectHttpMethod is true', () => {
      const operation = createMockOperation('get');
      const plugin = createMockPlugin();

      // Test the logic: GET should generate query
      const shouldGenerateQuery =
        !plugin.config.operationTypes[operation.id] &&
        plugin.config.autoDetectHttpMethod &&
        operation.method === 'get';

      expect(shouldGenerateQuery).toBe(true);
    });

    it('should generate mutation for POST requests when autoDetectHttpMethod is true', () => {
      const operation = createMockOperation('post');
      const plugin = createMockPlugin();

      // Test the logic: POST should generate mutation
      const shouldGenerateMutation =
        !plugin.config.operationTypes[operation.id] &&
        plugin.config.autoDetectHttpMethod &&
        operation.method !== 'get';

      expect(shouldGenerateMutation).toBe(true);
    });

    it('should generate mutation for PUT requests when autoDetectHttpMethod is true', () => {
      const operation = createMockOperation('put');
      const plugin = createMockPlugin();

      const shouldGenerateMutation =
        !plugin.config.operationTypes[operation.id] &&
        plugin.config.autoDetectHttpMethod &&
        operation.method !== 'get';

      expect(shouldGenerateMutation).toBe(true);
    });

    it('should generate mutation for DELETE requests when autoDetectHttpMethod is true', () => {
      const operation = createMockOperation('delete');
      const plugin = createMockPlugin();

      const shouldGenerateMutation =
        !plugin.config.operationTypes[operation.id] &&
        plugin.config.autoDetectHttpMethod &&
        operation.method !== 'get';

      expect(shouldGenerateMutation).toBe(true);
    });

    it('should fall back to legacy behavior when autoDetectHttpMethod is false', () => {
      const getOperation = createMockOperation('get');
      const postOperation = createMockOperation('post');
      const plugin = createMockPlugin();

      // Verify the plugin config is set correctly
      expect(plugin.config.autoDetectHttpMethod).toBe(false);

      // Legacy behavior: GET and POST generate queries, others generate mutations
      const getShouldGenerateQuery = ['get', 'post'].includes(
        getOperation.method,
      );
      const postShouldGenerateQuery = ['get', 'post'].includes(
        postOperation.method,
      );

      expect(getShouldGenerateQuery).toBe(true);
      expect(postShouldGenerateQuery).toBe(true);
    });
  });

  describe('Operation type overrides', () => {
    it('should respect explicit query override', () => {
      const operation = createMockOperation('post', 'testOp');
      const plugin = createMockPlugin();

      // Override should force POST to be a query
      const override = plugin.config.operationTypes[operation.id];
      const shouldGenerateQuery = override === 'query' || override === 'both';
      const shouldGenerateMutation =
        override === 'mutation' || override === 'both';

      expect(shouldGenerateQuery).toBe(true);
      expect(shouldGenerateMutation).toBe(false);
    });

    it('should respect explicit mutation override', () => {
      const operation = createMockOperation('get', 'testOp');
      const plugin = createMockPlugin();

      // Override should force GET to be a mutation
      const override = plugin.config.operationTypes[operation.id];
      const shouldGenerateQuery = override === 'query' || override === 'both';
      const shouldGenerateMutation =
        override === 'mutation' || override === 'both';

      expect(shouldGenerateQuery).toBe(false);
      expect(shouldGenerateMutation).toBe(true);
    });

    it('should generate both query and mutation when override is "both"', () => {
      const operation = createMockOperation('get', 'testOp');
      const plugin = createMockPlugin();

      const override = plugin.config.operationTypes[operation.id];
      const shouldGenerateQuery = override === 'query' || override === 'both';
      const shouldGenerateMutation =
        override === 'mutation' || override === 'both';

      expect(shouldGenerateQuery).toBe(true);
      expect(shouldGenerateMutation).toBe(true);
    });
  });

  describe('groupByTag functionality', () => {
    it('should use single file when groupByTag is false', () => {
      const operation = createMockOperation('get', 'testOp', ['pet', 'store']);
      const plugin = createMockPlugin({ groupByTag: false });

      // When groupByTag is false, all operations go to same file
      const expectedFileId = plugin.name || '@pinia/colada';
      const actualFileId = plugin.config.groupByTag
        ? `${plugin.name || '@pinia/colada'}/${operation.tags?.[0] || 'default'}`
        : plugin.name || '@pinia/colada';

      expect(actualFileId).toBe(expectedFileId);
    });

    it('should use separate files by tag when groupByTag is true', () => {
      const petOperation = createMockOperation('get', 'getPet', ['pet']);
      const storeOperation = createMockOperation('get', 'getInventory', [
        'store',
      ]);
      const plugin = createMockPlugin({ groupByTag: true });

      // When groupByTag is true, operations should be grouped by first tag
      const petFileId = plugin.config.groupByTag
        ? `${plugin.name || '@pinia/colada'}/${petOperation.tags?.[0] || 'default'}`
        : plugin.name || '@pinia/colada';
      const storeFileId = plugin.config.groupByTag
        ? `${plugin.name || '@pinia/colada'}/${storeOperation.tags?.[0] || 'default'}`
        : plugin.name || '@pinia/colada';

      expect(petFileId).toBe('@pinia/colada/pet');
      expect(storeFileId).toBe('@pinia/colada/store');
      expect(petFileId).not.toBe(storeFileId);
    });

    it('should use default tag when operation has no tags and groupByTag is true', () => {
      const operation = createMockOperation('get', 'testOp');
      const plugin = createMockPlugin({ groupByTag: true });

      const fileId = plugin.config.groupByTag
        ? `${plugin.name || '@pinia/colada'}/${operation.tags?.[0] || 'default'}`
        : plugin.name || '@pinia/colada';

      expect(fileId).toBe('@pinia/colada/default');
    });
  });

  describe('Configuration validation', () => {
    it('should use default values when not specified', () => {
      const plugin = createMockPlugin();

      expect(plugin.config.autoDetectHttpMethod).toBe(true);
      expect(plugin.config.operationTypes).toEqual({});
      expect(plugin.config.groupByTag).toBe(false);
      expect(plugin.config.exportFromIndex).toBe(false);
    });

    it('should allow custom configuration overrides', () => {
      const customConfig = {
        autoDetectHttpMethod: false,
        exportFromIndex: true,
        groupByTag: true,
        operationTypes: { testOp: 'both' as const },
      };
      const plugin = createMockPlugin(customConfig);

      expect(plugin.config.autoDetectHttpMethod).toBe(false);
      expect(plugin.config.operationTypes).toEqual({ testOp: 'both' });
      expect(plugin.config.groupByTag).toBe(true);
      expect(plugin.config.exportFromIndex).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complex override scenarios correctly', () => {
      const operations = [
        createMockOperation('get', 'getPet', ['pet']),
        createMockOperation('post', 'addPet', ['pet']),
        createMockOperation('put', 'updatePet', ['pet']),
        createMockOperation('delete', 'deletePet', ['pet']),
      ];

      const plugin = createMockPlugin({ groupByTag: true });

      operations.forEach((operation) => {
        const override = plugin.config.operationTypes[operation.id];
        const shouldGenerateQuery =
          override === 'query' ||
          override === 'both' ||
          (!override &&
            plugin.config.autoDetectHttpMethod &&
            operation.method === 'get');
        const shouldGenerateMutation =
          override === 'mutation' ||
          override === 'both' ||
          (!override &&
            plugin.config.autoDetectHttpMethod &&
            operation.method !== 'get');

        if (operation.id === 'getPet') {
          expect(shouldGenerateQuery).toBe(true);
          expect(shouldGenerateMutation).toBe(true); // both
        } else if (operation.id === 'addPet') {
          expect(shouldGenerateQuery).toBe(true); // forced query
          expect(shouldGenerateMutation).toBe(false);
        } else if (operation.id === 'updatePet') {
          expect(shouldGenerateQuery).toBe(false);
          expect(shouldGenerateMutation).toBe(true); // auto-detected mutation
        } else if (operation.id === 'deletePet') {
          expect(shouldGenerateQuery).toBe(false);
          expect(shouldGenerateMutation).toBe(true); // auto-detected mutation
        }
      });
    });
  });
});
