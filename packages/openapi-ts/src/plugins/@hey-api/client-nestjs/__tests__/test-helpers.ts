import { vi } from 'vitest';

import type { HeyApiClientNestjsPlugin } from '../types';

/**
 * Creates a mock plugin instance for testing generators
 */
export const createMockPlugin = (
  config: Partial<HeyApiClientNestjsPlugin['Config']['config']> = {},
  contextOverrides: any = {},
): any => {
  const mockContext: any = {
    ir: {
      components: {
        parameters: {},
        requestBodies: {},
        schemas: {},
      },
      paths: {},
      servers: [],
    },
    package: {
      dependencies: {},
      name: '@hey-api/openapi-ts',
      version: '1.0.0',
    },
    plugins: {},
    ...contextOverrides,
  };

  const defaultConfig: any = {
    clientName: 'Api',
    output: './generated',
    throwOnError: false,
    ...config,
  };

  const symbolCounter = { value: 0 };

  return {
    api: {
      getSelector: vi.fn((type: string, value?: string) => {
        if (value) {
          return ['@hey-api/client-nestjs', type, value];
        }
        return ['@hey-api/client-nestjs', type];
      }),
    },
    config: defaultConfig,
    context: mockContext,
    forEach: vi.fn(),
    getPlugin: vi.fn(),
    getPluginOrThrow: vi.fn().mockReturnValue({
      api: {
        getSelector: vi.fn((type: string, id: string) => {
          return ['@hey-api/typescript', type, id];
        }),
      },
    }),
    getSymbol: vi.fn(),
    output: defaultConfig.output,
    querySymbol: vi.fn().mockImplementation((args: any) => {
      if (args.role === 'data') {
        return { placeholder: `${args.resourceId}Data` };
      }
      if (args.role === 'responses') {
        return { placeholder: `${args.resourceId}Response` };
      }
      return undefined;
    }),
    referenceSymbol: vi.fn(),
    registerSymbol: vi.fn().mockImplementation((symbol: any) => ({
      exported: symbol.exported,
      id: symbolCounter.value++,
      placeholder: symbol.name,
    })),
    setSymbolValue: vi.fn(),
  };
};

/**
 * Creates mock service groups for testing
 */
export const createMockServiceGroups = () => {
  const serviceGroups = new Map();

  serviceGroups.set('pets', {
    className: 'ApiPetsService',
    tag: 'pets',
  });

  serviceGroups.set('users', {
    className: 'ApiUsersService',
    tag: 'users',
  });

  serviceGroups.set('store', {
    className: 'ApiStoreService',
    tag: 'store',
  });

  return serviceGroups;
};

/**
 * Creates mock operations for testing
 */
export const createMockOperations = (): Array<any> => [
  {
    method: 'get' as const,
    operation: {
      description: 'Returns a list of pets',
      id: 'getPets',
      method: 'get' as const,
      operationId: 'getPets',
      parameters: {
        query: {
          limit: {
            required: false,
            schema: { type: 'integer' as const },
          },
        },
      },
      path: '/pets',
      responses: {
        '200': {
          description: 'A list of pets',
        },
      },
      summary: 'List all pets',
      tags: ['pets'],
    },
    path: '/pets',
  },
  {
    method: 'post' as const,
    operation: {
      body: {
        required: true,
      },
      description: 'Creates a new pet',
      id: 'createPet',
      method: 'post' as const,
      operationId: 'createPet',
      path: '/pets',
      responses: {
        '201': {
          description: 'Pet created',
        },
      },
      summary: 'Create a pet',
      tags: ['pets'],
    },
    path: '/pets',
  },
  {
    method: 'get' as const,
    operation: {
      description: 'Returns a pet by ID',
      id: 'getPetById',
      method: 'get' as const,
      operationId: 'getPetById',
      parameters: {
        path: {
          petId: {
            required: true,
            schema: { type: 'integer' as const },
          },
        },
      },
      path: '/pets/{petId}',
      responses: {
        '200': {
          description: 'Pet found',
        },
        '404': {
          description: 'Pet not found',
        },
      },
      summary: 'Get pet by ID',
      tags: ['pets'],
    },
    path: '/pets/{petId}',
  },
  {
    method: 'get' as const,
    operation: {
      description: 'Returns a list of users',
      id: 'getUsers',
      method: 'get' as const,
      operationId: 'getUsers',
      parameters: {
        header: {
          authorization: {
            required: true,
            schema: { type: 'string' as const },
          },
        },
        query: {
          page: {
            required: false,
            schema: { type: 'integer' as const },
          },
          size: {
            required: false,
            schema: { type: 'integer' as const },
          },
        },
      },
      path: '/users',
      responses: {
        '200': {
          description: 'A list of users',
        },
      },
      summary: 'List all users',
      tags: ['users'],
    },
    path: '/users',
  },
  {
    method: 'post' as const,
    operation: {
      body: {
        required: true,
      },
      description: 'Place an order for a pet',
      id: 'placeOrder',
      method: 'post' as const,
      operationId: 'placeOrder',
      path: '/store/orders',
      responses: {
        '200': {
          description: 'Order placed',
        },
      },
      summary: 'Place an order',
      tags: ['store'],
    },
    path: '/store/orders',
  },
];

/**
 * Creates a mock context with operations
 */
export const createMockContextWithOperations = (): any => {
  const operations = createMockOperations();
  const paths: any = {};

  // Group operations by path
  for (const { method, operation, path } of operations) {
    if (!paths[path]) {
      paths[path] = {};
    }
    paths[path][method] = operation;
  }

  return {
    ir: {
      components: {
        parameters: {},
        requestBodies: {},
        schemas: {},
      },
      paths,
      servers: [
        {
          description: 'Production server',
          url: 'https://api.example.com/v1',
        },
      ],
    },
    package: {
      dependencies: {},
      name: '@hey-api/openapi-ts',
      version: '1.0.0',
    },
    plugins: {},
  };
};
