import type { FieldsConfig } from '../bundle/params';
import { buildClientParams } from '../bundle/params';

describe('buildClientParams', () => {
  const scenarios: ReadonlyArray<{
    args: ReadonlyArray<unknown>;
    config: FieldsConfig;
    description: string;
    params: Record<string, unknown>;
  }> = [
    {
      args: [1, 2, 3, 4],
      config: [
        {
          in: 'path',
          key: 'foo',
        },
        {
          in: 'query',
          key: 'bar',
        },
        {
          in: 'headers',
          key: 'baz',
        },
        {
          in: 'body',
          key: 'qux',
        },
      ],
      description: 'positional arguments',
      params: {
        body: {
          qux: 4,
        },
        headers: {
          baz: 3,
        },
        path: {
          foo: 1,
        },
        query: {
          bar: 2,
        },
      },
    },
    {
      args: [
        {
          bar: 2,
          baz: 3,
          foo: 1,
          qux: 4,
        },
      ],
      config: [
        {
          args: [
            {
              in: 'path',
              key: 'foo',
            },
            {
              in: 'query',
              key: 'bar',
            },
            {
              in: 'headers',
              key: 'baz',
            },
            {
              in: 'body',
              key: 'qux',
            },
          ],
        },
      ],
      description: 'flat arguments',
      params: {
        body: {
          qux: 4,
        },
        headers: {
          baz: 3,
        },
        path: {
          foo: 1,
        },
        query: {
          bar: 2,
        },
      },
    },
    {
      args: [
        1,
        2,
        {
          baz: 3,
          qux: 4,
        },
      ],
      config: [
        {
          in: 'path',
          key: 'foo',
        },
        {
          in: 'query',
          key: 'bar',
        },
        {
          args: [
            {
              in: 'headers',
              key: 'baz',
            },
            {
              in: 'body',
              key: 'qux',
            },
          ],
        },
      ],
      description: 'mixed arguments',
      params: {
        body: {
          qux: 4,
        },
        headers: {
          baz: 3,
        },
        path: {
          foo: 1,
        },
        query: {
          bar: 2,
        },
      },
    },
    {
      args: [1, 2, 3, 4],
      config: [
        {
          in: 'path',
          key: 'foo',
          map: 'f_o_o',
        },
        {
          in: 'query',
          key: 'bar',
          map: 'b_a_r',
        },
        {
          in: 'headers',
          key: 'baz',
          map: 'b_a_z',
        },
        {
          in: 'body',
          key: 'qux',
          map: 'q_u_x',
        },
      ],
      description: 'positional mapped arguments',
      params: {
        body: {
          q_u_x: 4,
        },
        headers: {
          b_a_z: 3,
        },
        path: {
          f_o_o: 1,
        },
        query: {
          b_a_r: 2,
        },
      },
    },
    {
      args: [
        {
          bar: 2,
          baz: 3,
          foo: 1,
          qux: 4,
        },
      ],
      config: [
        {
          args: [
            {
              in: 'path',
              key: 'foo',
              map: 'f_o_o',
            },
            {
              in: 'query',
              key: 'bar',
              map: 'b_a_r',
            },
            {
              in: 'headers',
              key: 'baz',
              map: 'b_a_z',
            },
            {
              in: 'body',
              key: 'qux',
              map: 'q_u_x',
            },
          ],
        },
      ],
      description: 'flat mapped arguments',
      params: {
        body: {
          q_u_x: 4,
        },
        headers: {
          b_a_z: 3,
        },
        path: {
          f_o_o: 1,
        },
        query: {
          b_a_r: 2,
        },
      },
    },
    {
      args: [1],
      config: [
        {
          in: 'body',
        },
      ],
      description: 'positional primitive body',
      params: {
        body: 1,
      },
    },
    {
      args: [
        {
          foo: 1,
        },
      ],
      config: [
        {
          key: 'foo',
          map: 'body',
        },
      ],
      description: 'alias flat body',
      params: {
        body: 1,
      },
    },
    {
      args: [
        {
          bar: 2,
          baz: 3,
          foo: 1,
          qux: 4,
        },
      ],
      config: [
        {
          in: 'body',
        },
      ],
      description: 'positional complex body',
      params: {
        body: {
          bar: 2,
          baz: 3,
          foo: 1,
          qux: 4,
        },
      },
    },
    {
      args: [
        {
          $body_qux: 4,
          $headers_baz: 3,
          $path_foo: 1,
          $query_bar: 2,
        },
      ],
      config: [
        {
          allowExtra: {},
        },
      ],
      description: 'namespace extra arguments',
      params: {
        body: {
          qux: 4,
        },
        headers: {
          baz: 3,
        },
        path: {
          foo: 1,
        },
        query: {
          bar: 2,
        },
      },
    },
    {
      args: [
        {
          bar: 2,
          baz: 3,
          foo: 1,
          qux: 4,
        },
      ],
      config: [
        {
          allowExtra: {
            query: true,
          },
        },
      ],
      description: 'slot extra arguments',
      params: {
        query: {
          bar: 2,
          baz: 3,
          foo: 1,
          qux: 4,
        },
      },
    },
    {
      args: [],
      config: [],
      description: 'strip empty slots',
      params: {},
    },
    {
      args: [[]],
      config: [
        {
          in: 'body',
        },
      ],
      description: 'empty array body',
      params: {
        body: [],
      },
    },
  ];

  it.each(scenarios)('$description', async ({ args, config, params }) => {
    expect(buildClientParams(args, config)).toEqual(params);
  });

  describe('prototype pollution guards (GHSA-hhx9-57xq-r5rw)', () => {
    const queryFields: FieldsConfig = [{ args: [{ in: 'query', key: 'q' }] }];

    it('drops $query___proto__ and preserves prototype chain', () => {
      const result = buildClientParams(
        [{ $query___proto__: { isAdmin: true }, q: 'hello' }],
        queryFields,
      );
      const q = result.query as Record<string, unknown>;
      expect(Object.getPrototypeOf(q)).toBe(Object.prototype);
      expect(q.isAdmin).toBeUndefined();
      expect(q.q).toBe('hello');
    });

    it('drops $headers___proto__ (slot stripped when empty)', () => {
      const result = buildClientParams(
        [{ $headers___proto__: { injected: true }, q: 'hello' }],
        queryFields,
      );
      // slot has no own properties after guard → stripEmptySlots removes it
      expect(result.headers).toBeUndefined();
    });

    it('drops $path___proto__ (slot stripped when empty)', () => {
      const result = buildClientParams(
        [{ $path___proto__: { injected: true }, q: 'hello' }],
        queryFields,
      );
      // slot has no own properties after guard → stripEmptySlots removes it
      expect(result.path).toBeUndefined();
    });

    it('drops $query_constructor', () => {
      const result = buildClientParams(
        [{ $query_constructor: { prototype: { injected: true } }, q: 'hello' }],
        queryFields,
      );
      expect((result.query as any).constructor).toBe(Object);
    });

    it('drops __proto__ key in allowExtra branch', () => {
      const result = buildClientParams(
        [{ __proto__: { isAdmin: true }, q: 'hello' }],
        [{ allowExtra: { query: true } }],
      );
      expect(Object.getPrototypeOf(result.query)).toBe(Object.prototype);
    });

    it('does not affect global Object.prototype', () => {
      buildClientParams([{ $query___proto__: { isAdmin: true }, q: 'hello' }], queryFields);
      expect(({} as any).isAdmin).toBeUndefined();
    });

    it('still processes legitimate $query_ extra keys', () => {
      const result = buildClientParams([{ $query_extra: 'value', q: 'hello' }], queryFields);
      const q = result.query as Record<string, unknown>;
      expect(q.extra).toBe('value');
      expect(q.q).toBe('hello');
    });
  });
});
