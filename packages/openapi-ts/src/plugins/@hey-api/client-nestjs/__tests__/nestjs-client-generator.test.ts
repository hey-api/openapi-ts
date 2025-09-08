import { describe, expect, it } from 'vitest';

import { generateNestjsClient } from '../nestjs-client-generator';
import { createMockPlugin } from './test-helpers';

describe('nestjs-client-generator', () => {
  describe('generateNestjsClient', () => {
    it('should generate client with default client name', () => {
      const plugin = createMockPlugin();

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('ApiClient');
      expect(result.configToken).toBe('API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5); // nestjs import, axios import, types import, client class, config token export
    });

    it('should generate client with custom client name', () => {
      const plugin = createMockPlugin({ clientName: 'CustomApi' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('CustomApiClient');
      expect(result.configToken).toBe('CUSTOM_API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should generate client with custom client class name', () => {
      const plugin = createMockPlugin({
        clientClassName: 'TestApiCustomClient',
        clientName: 'TestApi',
      });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('TestApiCustomClient');
      expect(result.configToken).toBe('TEST_API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle kebab-case client names', () => {
      const plugin = createMockPlugin({ clientName: 'my-awesome-api' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('MyAwesomeApiClient');
      expect(result.configToken).toBe('MY_AWESOME_API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle snake_case client names', () => {
      const plugin = createMockPlugin({ clientName: 'my_awesome_api' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('MyAwesomeApiClient');
      expect(result.configToken).toBe('MY_AWESOME_API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle camelCase client names', () => {
      const plugin = createMockPlugin({ clientName: 'camelCaseApi' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('CamelCaseApiClient');
      expect(result.configToken).toBe('CAMEL_CASE_API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle PascalCase client names', () => {
      const plugin = createMockPlugin({ clientName: 'PascalCaseApi' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('PascalCaseApiClient');
      expect(result.configToken).toBe('PASCAL_CASE_API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle different output paths', () => {
      const plugin = createMockPlugin({
        clientName: 'PathApi',
      });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('PathApiClient');
      expect(result.configToken).toBe('PATH_API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle edge case with very long client name', () => {
      const plugin = createMockPlugin({
        clientName: 'VeryLongClientNameThatExceedsNormalLength',
      });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe(
        'VeryLongClientNameThatExceedsNormalLengthClient',
      );
      expect(result.configToken).toBe(
        'VERY_LONG_CLIENT_NAME_THAT_EXCEEDS_NORMAL_LENGTH_CLIENT_CONFIG',
      );
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle edge case with single character client name', () => {
      const plugin = createMockPlugin({ clientName: 'A' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('AClient');
      expect(result.configToken).toBe('A_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle numeric client names', () => {
      const plugin = createMockPlugin({ clientName: 'Api2' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('Api2Client');
      expect(result.configToken).toBe('API2_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle client names with special characters', () => {
      const plugin = createMockPlugin({ clientName: 'my-api_v2.0' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('MyApiV20Client');
      expect(result.configToken).toBe('MY_API_V2_0_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle client names with numbers and underscores', () => {
      const plugin = createMockPlugin({ clientName: 'test_api_v1_2_3' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('TestApiV123Client');
      expect(result.configToken).toBe('TEST_API_V1_2_3_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should preserve custom client class name over generated one', () => {
      const plugin = createMockPlugin({
        clientClassName: 'CompletelyDifferentClientName',
        clientName: 'DefaultApi',
      });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('CompletelyDifferentClientName');
      expect(result.configToken).toBe('DEFAULT_API_CLIENT_CONFIG'); // Config token still based on clientName
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });

    it('should handle empty string client name gracefully', () => {
      const plugin = createMockPlugin({ clientName: '' });

      const result = generateNestjsClient({ plugin });

      expect(result.clientClassName).toBe('ApiClient');
      expect(result.configToken).toBe('API_CLIENT_CONFIG');
      expect(plugin.createFile).toHaveBeenCalledWith({
        id: 'nestjs-client',
        path: plugin.output,
      });

      const mockFile = plugin.createFile.mock.results[0].value;
      expect(mockFile.add).toHaveBeenCalledTimes(5);
    });
  });
});
