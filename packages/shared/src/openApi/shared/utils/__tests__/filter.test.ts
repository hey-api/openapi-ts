import type { Logger } from '@hey-api/codegen-core';

import type { ResourceMetadata } from '../../graph/meta';
import { createFilteredDependencies, type Filters } from '../filter';

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

function createResourceMetadata(): ResourceMetadata {
  return {
    operations: new Map([
      [
        'operation/GET /v1/foo',
        {
          dependencies: new Set(['response/UsedResponse']),
          deprecated: false,
          tags: new Set(),
        },
      ],
    ]),
    parameters: new Map(),
    requestBodies: new Map([
      [
        'body/IncludedBody',
        {
          dependencies: new Set(['schema/Baz']),
          deprecated: false,
        },
      ],
    ]),
    responses: new Map([
      [
        'response/UsedResponse',
        {
          dependencies: new Set(),
          deprecated: false,
        },
      ],
    ]),
    schemas: new Map([
      [
        'schema/Foo',
        {
          dependencies: new Set(['schema/Baz']),
          deprecated: false,
        },
      ],
      [
        'schema/Baz',
        {
          dependencies: new Set(),
          deprecated: false,
        },
      ],
    ]),
  };
}

describe('createFilteredDependencies', () => {
  it('keeps explicitly included schemas and their dependencies when dropping orphans', () => {
    const filters = createFilters();
    filters.schemas.include.add('schema/Foo');

    const { schemas } = createFilteredDependencies({
      filters,
      logger: loggerStub,
      resourceMetadata: createResourceMetadata(),
    });

    expect(schemas).toEqual(new Set(['schema/Foo', 'schema/Baz']));
  });

  it('keeps explicitly included request bodies and their schema dependencies when dropping orphans', () => {
    const filters = createFilters();
    filters.requestBodies.include.add('body/IncludedBody');

    const { requestBodies, schemas } = createFilteredDependencies({
      filters,
      logger: loggerStub,
      resourceMetadata: createResourceMetadata(),
    });

    expect(requestBodies).toEqual(new Set(['body/IncludedBody']));
    expect(schemas).toEqual(new Set(['schema/Baz']));
  });

  it('prioritizes excludes when the same schema is explicitly included and excluded', () => {
    const filters = createFilters();
    filters.schemas.include.add('schema/Foo');
    filters.schemas.exclude.add('schema/Foo');

    const { schemas } = createFilteredDependencies({
      filters,
      logger: loggerStub,
      resourceMetadata: createResourceMetadata(),
    });

    expect(schemas).toEqual(new Set());
  });
});
