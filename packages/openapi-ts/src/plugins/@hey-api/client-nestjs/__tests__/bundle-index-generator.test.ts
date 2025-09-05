import { describe, expect, it } from 'vitest';

import { generateNestjsIndex } from '../bundle-index-generator';
import { createMockPlugin, createMockServiceGroups } from './test-helpers';

describe('bundle-index-generator', () => {
  describe('generateNestjsIndex', () => {
    it('should generate index file with default client name', () => {
      const plugin = createMockPlugin();
      const serviceGroups = createMockServiceGroups();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6); // module, client, 3 services, types
    });

    it('should generate index file with custom client name', () => {
      const plugin = createMockPlugin({ clientName: 'MyApi' });
      const serviceGroups = createMockServiceGroups();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6); // module, client, 3 services, types
    });

    it('should generate index file with custom module name', () => {
      const plugin = createMockPlugin({
        clientName: 'CustomApi',
        moduleName: 'CustomApiModule',
      });
      const serviceGroups = createMockServiceGroups();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6);
    });

    it('should generate index file with custom client class name', () => {
      const plugin = createMockPlugin({
        clientClassName: 'TestApiCustomClient',
        clientName: 'TestApi',
      });
      const serviceGroups = createMockServiceGroups();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6);
    });

    it('should handle empty service groups', () => {
      const plugin = createMockPlugin();
      const serviceGroups = new Map();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(3); // module, client, types (no services)
    });

    it('should handle single service group', () => {
      const plugin = createMockPlugin({ clientName: 'SingleApi' });
      const serviceGroups = new Map();
      serviceGroups.set('pets', {
        className: 'SingleApiPetsService',
        tag: 'pets',
      });

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(4); // module, client, 1 service, types
    });

    it('should handle many service groups', () => {
      const plugin = createMockPlugin({ clientName: 'LargeApi' });
      const serviceGroups = new Map();

      // Add multiple service groups
      for (let i = 0; i < 10; i++) {
        serviceGroups.set(`service${i}`, {
          className: `LargeApiService${i}Service`,
          tag: `service${i}`,
        });
      }

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(13); // module, client, 10 services, types
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

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5); // module, client, 2 services, types
    });

    it('should handle kebab-case client names', () => {
      const plugin = createMockPlugin({ clientName: 'my-awesome-api' });
      const serviceGroups = createMockServiceGroups();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6);
    });

    it('should handle snake_case client names', () => {
      const plugin = createMockPlugin({ clientName: 'my_awesome_api' });
      const serviceGroups = createMockServiceGroups();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6);
    });

    it('should handle different output paths', () => {
      const plugin = createMockPlugin({
        clientName: 'PathApi',
      });
      const serviceGroups = createMockServiceGroups();

      generateNestjsIndex({ plugin, serviceGroups });

      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-index',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(6);
    });
  });
});
