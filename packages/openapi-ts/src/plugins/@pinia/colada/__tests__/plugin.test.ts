import { describe, expect, it, type Mock, vi } from 'vitest';

import { TypeScriptFile } from '../../../../generate/files';
import type { IR } from '../../../../ir/types';
import type { Plugin } from '../../../types';
import { handler } from '../plugin';
import type { Config } from '../types';

describe('@pinia/colada plugin', () => {
  // Test setup helper to create a mock context and operation
  const createMockContext = () => {
    const file = new TypeScriptFile({ dir: '/', name: 'test.ts' });
    const files = new Map([['/test.ts', file]]);

    const subscribe = vi.fn() as Mock;
    const fileGetter = vi.fn().mockReturnValue(file);

    return {
      createFile: vi.fn().mockReturnValue(file),
      file: fileGetter,
      files,
      subscribe,
    } as unknown as IR.Context;
  };

  const basicBody = {
    mediaType: 'application/json',
    schema: {
      properties: {
        name: { type: 'string' } as IR.SchemaObject,
      },
      required: ['name'],
      type: 'object',
    } as IR.SchemaObject,
  };

  // Test: Query Generation
  describe('query generation', () => {
    it('generates a query function for GET operations', () => {
      const context = createMockContext();
      const plugin: Plugin.Instance<Config> = {
        exportFromIndex: false,
        name: '@pinia/colada',
        output: '',
      };

      const operation: IR.OperationObject = {
        deprecated: false,
        description: 'Retrieves a user by their unique identifier',
        id: 'getUser',
        method: 'get',
        path: '/users/{id}',
        summary: 'Get user by ID',
        tags: ['users'],
      } as IR.OperationObject;

      handler({ context, plugin });

      // Verify subscription was created
      expect(context.subscribe).toHaveBeenCalledWith(
        'operation',
        expect.any(Function),
      );

      // Trigger the subscription callback
      const callback = (context.subscribe as Mock).mock.calls[0][1];
      callback({ operation });

      // Verify file content contains expected query definition
      const file = context.file({ id: plugin.name });
      if (!file) throw new Error('File not found');

      const content = file.toString();
      expect(content).toContain('export const useGetUserQuery');
      expect(content).toContain('defineQuery');
      expect(content).toContain('@pinia/colada');
    });
  });

  // Test: Mutation Generation
  describe('mutation generation', () => {
    it('generates a mutation function for POST operations with body', () => {
      const context = createMockContext();
      const plugin: Plugin.Instance<Config> = {
        exportFromIndex: false,
        name: '@pinia/colada',
        output: '',
      };

      const operation: IR.OperationObject = {
        body: basicBody,
        deprecated: false,
        id: 'createUser',
        method: 'post',
        path: '/users',
        summary: 'Create new user',
        tags: ['users'],
      } as IR.OperationObject;

      handler({ context, plugin });

      // Trigger the subscription callback
      const callback = (context.subscribe as Mock).mock.calls[0][1];
      callback({ operation });

      // Verify file content contains expected mutation definition
      const file = context.file({ id: plugin.name });
      if (!file) throw new Error('File not found');

      const content = file.toString();
      expect(content).toContain('export const useCreateUserMutation');
      expect(content).toContain('defineMutation');
    });
  });

  // Test: File Grouping
  describe('file grouping', () => {
    it('groups operations by tag when groupByTag is true', () => {
      const context = createMockContext();
      const plugin: Plugin.Instance<Config> = {
        exportFromIndex: false,
        groupByTag: true,
        name: '@pinia/colada',
        output: '',
      };

      const operation: IR.OperationObject = {
        id: 'getUser',
        method: 'get',
        path: '/users/{id}',
        tags: ['users'],
      } as IR.OperationObject;

      handler({ context, plugin });

      // Trigger the subscription callback
      const callback = (context.subscribe as Mock).mock.calls[0][1];
      callback({ operation });

      // Verify file was created with tag-based path
      expect(context.createFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringContaining('/users'),
        }),
      );
    });
  });

  // Test: Hook Customization
  // TODO: parser - add support for hooks
  /*   describe('hook customization', () => {
      it('respects onQuery hook to skip query generation', () => {
        const context = createMockContext();
        const plugin: Plugin.Instance<Config> = {
          exportFromIndex: false,
          hooks: {
            onQuery: vi.fn().mockReturnValue(false),
          },
          name: '@pinia/colada',
          output: '',
        };

        const operation: IR.OperationObject = {
          id: 'getUser',
          method: 'get',
          path: '/users/{id}',
        } as IR.OperationObject;

        handler({ context, plugin });

        // Trigger the subscription callback
        const callback = (context.subscribe as Mock).mock.calls[0][1];
        callback({ operation });

        // Verify hook was called
        expect(plugin.hooks!.onQuery).toHaveBeenCalledWith(operation);

        // Verify no query was generated
        const file = context.file({ id: plugin.name });
        if (!file) throw new Error('File not found');

        const content = file.toString();
        expect(content).not.toContain('useGetUserQuery');
      });

      it('uses custom query key from getQueryKey hook', () => {
        const context = createMockContext();
        const plugin: Plugin.Instance<Config> = {
          exportFromIndex: false,
          hooks: {
            getQueryKey: vi.fn().mockReturnValue(['custom', 'key']),
          },
          name: '@pinia/colada',
          output: '',
        };

        const operation: IR.OperationObject = {
          id: 'getUser',
          method: 'get',
          path: '/users/{id}',
        } as IR.OperationObject;

        handler({ context, plugin });

        // Trigger the subscription callback
        const callback = (context.subscribe as Mock).mock.calls[0][1];
        callback({ operation });

        // Verify hook was called
        expect(plugin.hooks!.getQueryKey).toHaveBeenCalledWith(operation);

        // Verify custom key was used
        const file = context.file({ id: plugin.name });
        if (!file) throw new Error('File not found');

        const content = file.toString();
        expect(content).toContain(`[\n        'custom',\n        'key'\n    ]`);
      });
    }); */

  // Test: Operation ID Formatting
  describe('operation id formatting', () => {
    it('converts operation ids to camelCase', () => {
      const context = createMockContext();
      const plugin: Plugin.Instance<Config> = {
        exportFromIndex: false,
        name: '@pinia/colada',
        output: '',
      };

      const operations: IR.OperationObject[] = [
        {
          id: 'get_user_profile',
          method: 'get',
          path: '/users/{id}/profile',
          tags: ['users'],
        } as IR.OperationObject,
        {
          body: basicBody,
          id: 'UPDATE-USER-SETTINGS',
          method: 'put',
          path: '/users/{id}/settings',
          tags: ['users'],
        } as IR.OperationObject,
        {
          id: 'delete.user.account',
          method: 'delete',
          path: '/users/{id}',
          tags: ['users'],
        } as IR.OperationObject,
      ];

      handler({ context, plugin });

      // Test each operation
      operations.forEach((operation) => {
        const callback = (context.subscribe as Mock).mock.calls[0][1];
        callback({ operation });
      });

      // Verify file content contains properly camelCased function names
      const file = context.file({ id: plugin.name });
      if (!file) throw new Error('File not found');

      const content = file.toString();
      expect(content).toContain('useGetUserProfileQuery');
      expect(content).toContain('useUpdateUserSettingsMutation');
      expect(content).toContain('useDeleteUserAccountQuery');
    });
  });

  // Test: Operation Type Detection
  // TODO: parser - add support for hooks
  /*   describe('operation type detection', () => {
      it('respects isQuery hook override', () => {
        const context = createMockContext();
        const plugin: Plugin.Instance<Config> = {
          exportFromIndex: false,
          hooks: {
            isQuery: vi.fn().mockReturnValue(true),
          },
          name: '@pinia/colada',
          output: '',
        };

        // Test POST operation that would normally be a mutation
        const operation: IR.OperationObject = {
          body: {
            mediaType: 'application/json',
            schema: {},
          },
          id: 'createUser',
          method: 'post',
          path: '/users',
        } as IR.OperationObject;

        handler({ context, plugin });

        // Trigger the subscription callback
        const callback = (context.subscribe as Mock).mock.calls[0][1];
        callback({ operation });

        // Verify hook was called
        expect(plugin.hooks!.isQuery).toHaveBeenCalledWith(operation);

        // Verify operation was treated as a query despite being POST
        const file = context.file({ id: plugin.name });
        if (!file) throw new Error('File not found');

        const content = file.toString();
        expect(content).toContain('useCreateUserQuery');
        expect(content).not.toContain('useCreateUserMutation');
      });
    }); */

  // Test: Code Generation Snapshots
  describe('code generation snapshots', () => {
    it('generates properly typed query with response and error types', () => {
      const context = createMockContext();
      const plugin: Plugin.Instance<Config> = {
        exportFromIndex: false,
        name: '@pinia/colada',
        output: '',
      };

      const operation: IR.OperationObject = {
        deprecated: false,
        description: 'Get user profile data',
        id: 'getUserProfile',
        method: 'get',
        path: '/users/{id}/profile',
        responses: {
          '200': {
            mediaType: 'application/json',
            schema: {
              properties: {
                email: { type: 'string' } as IR.SchemaObject,
                id: { type: 'number' } as IR.SchemaObject,
                name: { type: 'string' } as IR.SchemaObject,
              },
              type: 'object',
            } as IR.SchemaObject,
          } as IR.ResponseObject,
          '404': {
            mediaType: 'application/json',
            schema: {
              properties: {
                message: { type: 'string' } as IR.SchemaObject,
              },
              type: 'object',
            } as IR.SchemaObject,
          } as IR.ResponseObject,
        } as IR.ResponsesObject,
        summary: 'Get user profile',
        tags: ['users'],
      } as IR.OperationObject;

      handler({ context, plugin });

      // Trigger the subscription callback
      const callback = (context.subscribe as Mock).mock.calls[0][1];
      callback({ operation });

      // Get generated code
      const file = context.file({ id: plugin.name });
      if (!file) throw new Error('File not found');
      expect(file.toString()).toMatchSnapshot('query-with-types');
    });

    it('generates properly typed query with hook overrides', () => {
      const context = createMockContext();
      const plugin: Plugin.Instance<Config> = {
        exportFromIndex: false,
        name: '@pinia/colada',
        onMutation: vi.fn().mockReturnValue(true),
        onQuery: vi.fn().mockReturnValue(true),
        output: '',
        resolveQuery: vi.fn().mockReturnValue(true),
        resolveQueryKey: vi.fn().mockReturnValue(['users', 'search']),
      };

      const operation: IR.OperationObject = {
        body: {
          mediaType: 'application/json',
          schema: {
            properties: {
              query: { type: 'string' } as IR.SchemaObject,
            },
            type: 'object',
          } as IR.SchemaObject,
          type: 'json',
        },
        deprecated: false,
        description: 'Search users with POST body',
        id: 'searchUsers',
        method: 'post',
        path: '/users/search',
        responses: {
          '200': {
            mediaType: 'application/json',
            schema: {
              items: [
                {
                  properties: {
                    id: { type: 'number' } as IR.SchemaObject,
                    name: { type: 'string' } as IR.SchemaObject,
                  },
                  type: 'object',
                } as IR.SchemaObject,
              ],
              type: 'array',
            } as IR.SchemaObject,
          } as IR.ResponseObject,
        } as IR.ResponsesObject,
        summary: 'Search users',
        tags: ['users'],
      } as IR.OperationObject;

      handler({ context, plugin });

      // Trigger the subscription callback
      const callback = (context.subscribe as Mock).mock.calls[0][1];
      callback({ operation });

      // Get generated code
      const file = context.file({ id: plugin.name });
      if (!file) throw new Error('File not found');
      expect(file.toString()).toMatchSnapshot(
        'typed-query-with-hook-overrides',
      );
    });
  });
});
