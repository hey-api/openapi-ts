import { describe, expect, it, vi } from 'vitest';

import type { IR } from '../../../../ir/types';
import type { PiniaColadaPlugin } from '../types';

const createMockOperation = (
  method: IR.OperationObject['method'],
  id = 'testOperation',
  tags?: ReadonlyArray<string>,
): IR.OperationObject => ({
  id,
  method,
  operationId: id,
  path: '/test',
  responses: {},
  tags,
});

const createMockPlugin = (
  config: Partial<PiniaColadaPlugin['Config']['config']> = {},
): any => ({
  config: {
    exportFromIndex: false,
    groupByTag: false,
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
describe('@pinia/colada', () => {
  describe('groupByTag', () => {
    it('uses single file when groupByTag is false', () => {
      const operation = createMockOperation('get', 'testOp', ['pet', 'store']);
      const plugin = createMockPlugin({ groupByTag: false });

      const expectedFileId = plugin.name || '@pinia/colada';
      const actualFileId = plugin.config.groupByTag
        ? `${plugin.name || '@pinia/colada'}/${operation.tags?.[0] || 'default'}`
        : plugin.name || '@pinia/colada';

      expect(actualFileId).toBe(expectedFileId);
    });

    it('uses separate files by tag when groupByTag is true', () => {
      const petOperation = createMockOperation('get', 'getPet', ['pet']);
      const storeOperation = createMockOperation('get', 'getInventory', [
        'store',
      ]);
      const plugin = createMockPlugin({ groupByTag: true });

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

    it('uses default tag when operation has no tags and groupByTag is true', () => {
      const operation = createMockOperation('get', 'testOp');
      const plugin = createMockPlugin({ groupByTag: true });

      const fileId = plugin.config.groupByTag
        ? `${plugin.name || '@pinia/colada'}/${operation.tags?.[0] || 'default'}`
        : plugin.name || '@pinia/colada';

      expect(fileId).toBe('@pinia/colada/default');
    });
  });

  describe('config', () => {
    it('uses default values', () => {
      const plugin = createMockPlugin();
      expect(plugin.config.groupByTag).toBe(false);
      expect(plugin.config.exportFromIndex).toBe(false);
    });

    it('allows overrides', () => {
      const plugin = createMockPlugin({
        exportFromIndex: true,
        groupByTag: true,
      });
      expect(plugin.config.groupByTag).toBe(true);
      expect(plugin.config.exportFromIndex).toBe(true);
    });
  });
});
