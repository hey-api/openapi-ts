import { describe, expect, it } from 'vitest';

import { generateNestjsModule } from '../nestjs-module-generator';
import { createMockPlugin, createMockServiceGroups } from './test-helpers';

describe('nestjs-module-generator', () => {
  describe('generateNestjsModule', () => {
    it('should generate module with default client name', () => {
      const plugin = createMockPlugin();
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('ApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7); // nestjs import, types import, client import, 3 service imports, module class
    });

    it('should generate module with custom client name', () => {
      const plugin = createMockPlugin({ clientName: 'CustomApi' });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('CustomApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should generate module with custom module name', () => {
      const plugin = createMockPlugin({
        clientName: 'TestApi',
        moduleName: 'CustomTestApiModule',
      });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('CustomTestApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should handle empty service groups', () => {
      const plugin = createMockPlugin({ clientName: 'EmptyApi' });
      const serviceGroups = new Map();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('EmptyApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(4); // nestjs import, types import, client import, module class (no service imports)
    });

    it('should handle single service group', () => {
      const plugin = createMockPlugin({ clientName: 'SingleApi' });
      const serviceGroups = new Map();
      serviceGroups.set('pets', {
        className: 'SingleApiPetsService',
        tag: 'pets',
      });

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('SingleApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5); // nestjs import, types import, client import, 1 service import, module class
    });

    it('should handle many service groups', () => {
      const plugin = createMockPlugin({ clientName: 'LargeApi' });
      const serviceGroups = new Map();

      // Add multiple service groups
      for (let i = 0; i < 5; i++) {
        serviceGroups.set(`service${i}`, {
          className: `LargeApiService${i}Service`,
          tag: `service${i}`,
        });
      }

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('LargeApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(9); // nestjs import, types import, client import, 5 service imports, module class
    });

    it('should handle service groups with special characters in tags', () => {
      const plugin = createMockPlugin({ clientName: 'SpecialApi' });
      const serviceGroups = new Map();

      serviceGroups.set('pet-store', {
        className: 'SpecialApiPetStoreService',
        tag: 'pet-store',
      });

      serviceGroups.set('user_management', {
        className: 'SpecialApiUserManagementService',
        tag: 'user_management',
      });

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('SpecialApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6); // nestjs import, types import, client import, 2 service imports, module class
    });

    it('should handle kebab-case client names', () => {
      const plugin = createMockPlugin({ clientName: 'my-awesome-api' });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('MyAwesomeApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should handle snake_case client names', () => {
      const plugin = createMockPlugin({ clientName: 'my_awesome_api' });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('MyAwesomeApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should handle different output paths', () => {
      const plugin = createMockPlugin({
        clientName: 'PathApi',
      });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('PathApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should generate module with camelCase client name handling', () => {
      const plugin = createMockPlugin({ clientName: 'camelCaseApi' });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('CamelCaseApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should handle PascalCase client names', () => {
      const plugin = createMockPlugin({ clientName: 'PascalCaseApi' });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('PascalCaseApiModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should handle edge case with very long client name', () => {
      const plugin = createMockPlugin({
        clientName:
          'VeryLongClientNameThatExceedsNormalLengthForTestingPurposes',
      });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe(
        'VeryLongClientNameThatExceedsNormalLengthForTestingPurposesModule',
      );
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });

    it('should handle edge case with single character client name', () => {
      const plugin = createMockPlugin({ clientName: 'A' });
      const serviceGroups = createMockServiceGroups();

      const result = generateNestjsModule({ plugin, serviceGroups });

      expect(result).toBe('AModule');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-module',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(7);
    });
  });
});
