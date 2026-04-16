import type { Logger } from '@hey-api/codegen-core';

import { createFilteredDependencies, type Filters } from '../../utils/filter';
import { buildGraph } from '../../utils/graph';
import { buildResourceMetadata } from '../meta';

const loggerStub = {
  timeEvent: () => ({ timeEnd: () => {} }),
} as unknown as Logger;

function createFilters(): Filters {
  return {
    deprecated: true,
    operations: {
      exclude: new Set(),
      include: new Set(),
    },
    orphans: false,
    parameters: {
      exclude: new Set(),
      include: new Set(),
    },
    preserveOrder: false,
    requestBodies: {
      exclude: new Set(),
      include: new Set(),
    },
    responses: {
      exclude: new Set(),
      include: new Set(),
    },
    schemas: {
      exclude: new Set(),
      include: new Set(),
    },
    tags: {
      exclude: new Set(),
      include: new Set(),
    },
  };
}

describe('buildResourceMetadata', () => {
  it('decodes URI-encoded names in operation dependencies', () => {
    // Simulate a spec where the $ref value has been URL-encoded by the JSON schema
    // ref-parser (e.g. angle brackets in generic schema names: Foo<Bar> -> Foo%3CBar%3E).
    // The schema key in components/schemas remains unencoded (Foo<Bar>), but the $ref
    // pointing to it is URL-encoded. Without the fix, the dependency key would be
    // 'schema/Foo%3CBar%3E' which does not match 'schema/Foo<Bar>' in resourceMetadata.schemas.
    const spec = {
      components: {
        schemas: {
          ClientItem: {
            properties: { id: { type: 'string' } },
            type: 'object',
          },
          // Key uses literal angle brackets (as seen when traversing the spec object)
          'PaginatedList<ClientItem>': {
            properties: {
              items: {
                items: { $ref: '#/components/schemas/ClientItem' },
                type: 'array',
              },
            },
            type: 'object',
          },
        },
      },
      paths: {
        '/api/items': {
          get: {
            // $ref uses URL-encoded form as the JSON schema ref-parser would produce
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/PaginatedList%3CClientItem%3E' },
                  },
                },
                description: '',
              },
            },
            tags: ['Client'],
          },
        },
        '/api/other': {
          get: {
            responses: { '200': { description: '' } },
            tags: ['Other'],
          },
        },
      },
    };

    const { graph } = buildGraph(spec, loggerStub);
    const { resourceMetadata } = buildResourceMetadata(graph, loggerStub);

    // The operation's dependencies should use the decoded name so they match
    // the keys in resourceMetadata.schemas
    const opDeps =
      resourceMetadata.operations.get('operation/GET /api/items')?.dependencies ?? new Set();
    expect(opDeps.has('schema/PaginatedList<ClientItem>')).toBe(true);
    expect(opDeps.has('schema/PaginatedList%3CClientItem%3E')).toBe(false);
  });

  it('includes operations with URL-encoded schema references when filtering by tag', () => {
    // Reproduces the issue: when using tag filters, operations whose response schemas
    // have names with URL-unsafe characters (e.g. angle brackets for generic types like
    // PaginatedListItem<T>) were incorrectly dropped because the URL-encoded $ref
    // produced by the JSON schema ref-parser did not match the unencoded schema key
    // in resourceMetadata.schemas.
    const spec = {
      components: {
        schemas: {
          ClientItem: {
            properties: { id: { type: 'string' } },
            type: 'object',
          },
          OtherResponse: {
            properties: { name: { type: 'string' } },
            type: 'object',
          },
          'PaginatedList<ClientItem>': {
            properties: {
              items: {
                items: { $ref: '#/components/schemas/ClientItem' },
                type: 'array',
              },
            },
            type: 'object',
          },
        },
      },
      paths: {
        '/api/items': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    // URL-encoded $ref simulating what json-schema-ref-parser produces
                    schema: { $ref: '#/components/schemas/PaginatedList%3CClientItem%3E' },
                  },
                },
                description: '',
              },
            },
            tags: ['Client'],
          },
        },
        '/api/other': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/OtherResponse' },
                  },
                },
                description: '',
              },
            },
            tags: ['Other'],
          },
        },
      },
    };

    const { graph } = buildGraph(spec, loggerStub);
    const { resourceMetadata } = buildResourceMetadata(graph, loggerStub);

    const filters = createFilters();
    filters.tags.include.add('Client');

    const { operations } = createFilteredDependencies({
      filters,
      logger: loggerStub,
      resourceMetadata,
    });

    // The 'Client' tagged operation must be included despite the URL-encoded $ref
    expect(operations.has('operation/GET /api/items')).toBe(true);
    // The 'Other' tagged operation must be excluded
    expect(operations.has('operation/GET /api/other')).toBe(false);
  });
});
