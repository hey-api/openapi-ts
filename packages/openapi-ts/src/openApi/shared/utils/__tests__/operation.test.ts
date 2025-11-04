import { describe, expect, it } from 'vitest';

import type { Context } from '~/ir/context';

import { operationToId } from '../operation';

describe('operationToId', () => {
  const scenarios: Array<{
    id?: string;
    method: string;
    output: string;
    path: string;
  }> = [
    {
      method: 'post',
      output: 'postFoo',
      path: '/foo',
    },
    {
      id: 'Post-foo',
      method: 'post',
      output: 'postFoo',
      path: '/foo',
    },
    {
      method: 'post',
      output: 'postFooByFooId',
      path: '/foo/{foo_id}',
    },
    {
      method: 'post',
      output: 'postFooByFooIdBarBazQux',
      path: '/foo/{foo_id}/bar+baz:qux',
    },
  ];

  it.each(scenarios)(
    'transforms $method $path ($id) -> $output',
    async ({ id, method, output, path }) => {
      const context: Partial<Context> = {
        config: {
          plugins: {
            // @ts-expect-error
            '@hey-api/sdk': {
              config: {
                operationId: true,
              },
              name: '@hey-api/sdk',
            },
          },
        },
      };
      expect(
        operationToId({
          context: context as Context,
          id,
          method,
          path,
          state: {
            ids: new Map(),
          },
        }),
      ).toEqual(output);
    },
  );
});
