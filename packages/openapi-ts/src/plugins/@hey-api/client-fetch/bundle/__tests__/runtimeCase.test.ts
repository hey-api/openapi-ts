import { describe, expect, it } from 'vitest';

import { createClient } from '../client';

describe('client-fetch runtimeCase', () => {
  it('maps body, query, and response between clientCase and runtimeCase', async () => {
    const calls: Array<{ body: string; search: string; url: string }> = [];

    const fetchMock = async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      calls.push({
        body: await req.text(),
        search: url.searchParams.toString(),
        url: req.url,
      });
      const responseJson = { foo_bar: 1, nested_obj: { inner_key: 2 } };
      return new Response(JSON.stringify(responseJson), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    };

    const client = createClient({
      baseUrl: 'https://api.test',
      clientCase: 'camelCase',
      fetch: fetchMock as any,
      runtimeCase: 'snake_case',
    });

    const res = await client.post({
      body: { fooBar: 1 },
      path: { petId: 123 },
      query: { nestedObj: { innerKey: 'a' } },
      url: '/pets/{pet_id}',
    });

    expect(calls[0]).toBeDefined();
    // path params replaced
    expect(calls[0]!.url).toContain('/pets/123');
    // query transformed to snake_case deepObject style
    expect(calls[0]!.search).toContain('nested_obj%5Binner_key%5D=a');
    // body keys transformed to snake_case
    expect(JSON.parse(calls[0]!.body)).toEqual({ foo_bar: 1 });

    // response transformed back to camelCase (clientCase)
    expect(res).toEqual({
      data: { fooBar: 1, nestedObj: { innerKey: 2 } },
      request: expect.any(Request),
      response: expect.any(Response),
    });
  });
});
