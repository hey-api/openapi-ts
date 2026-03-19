import { pathToName } from '../path';

describe('pathToName', () => {
  // ── OpenAPI 3.x component schemas ──

  it('handles top-level schema', () => {
    expect(pathToName(['components', 'schemas', 'User'])).toBe('User');
  });

  it('handles nested property', () => {
    expect(pathToName(['components', 'schemas', 'User', 'properties', 'address'])).toBe(
      'User-address',
    );
  });

  it('handles deeply nested properties', () => {
    expect(
      pathToName(['components', 'schemas', 'User', 'properties', 'address', 'properties', 'city']),
    ).toBe('User-address-city');
  });

  it('handles property literally named "properties"', () => {
    expect(pathToName(['components', 'schemas', 'Foo', 'properties', 'properties'])).toBe(
      'Foo-properties',
    );
  });

  it('handles property named "properties" with children', () => {
    expect(
      pathToName([
        'components',
        'schemas',
        'Foo',
        'properties',
        'properties',
        'properties',
        'items',
      ]),
    ).toBe('Foo-properties-items');
  });

  it('handles property named "items"', () => {
    expect(pathToName(['components', 'schemas', 'Foo', 'properties', 'items'])).toBe('Foo-items');
  });

  // ── additionalProperties ──

  it('handles additionalProperties', () => {
    expect(pathToName(['components', 'schemas', 'Pet', 'additionalProperties'])).toBe('Pet-Value');
  });

  it('handles nested additionalProperties', () => {
    expect(
      pathToName([
        'components',
        'schemas',
        'Pet',
        'properties',
        'metadata',
        'additionalProperties',
      ]),
    ).toBe('Pet-metadata-Value');
  });

  // ── Array items ──

  it('handles array items (skips index)', () => {
    expect(
      pathToName(['components', 'schemas', 'Order', 'properties', 'line_items', 'items', 0]),
    ).toBe('Order-line_items');
  });

  it('handles items without numeric index', () => {
    expect(pathToName(['components', 'schemas', 'Result', 'items', 0])).toBe('Result');
  });

  // ── Tuple items ──

  it('handles tuple items at different indices', () => {
    expect(pathToName(['components', 'schemas', 'Pair', 'items', 0])).toBe('Pair');

    expect(pathToName(['components', 'schemas', 'Pair', 'items', 1])).toBe('Pair');
  });

  // ── patternProperties ──

  it('handles patternProperties', () => {
    expect(pathToName(['components', 'schemas', 'Config', 'patternProperties', '^x-'])).toBe(
      'Config-^x-',
    );
  });

  // ── OpenAPI 2.0 ──

  it('handles definitions (OpenAPI 2.0)', () => {
    expect(pathToName(['definitions', 'User'])).toBe('User');
  });

  it('handles definitions with nested properties', () => {
    expect(pathToName(['definitions', 'User', 'properties', 'address'])).toBe('User-address');
  });

  // ── Paths (operations) ──

  it('handles simple path', () => {
    expect(pathToName(['paths', '/event', 'get', 'properties', 'query'])).toBe('Event-get-query');
  });

  it('handles path with multiple segments', () => {
    expect(pathToName(['paths', '/api/v1/users', 'post', 'properties', 'body'])).toBe(
      'ApiV1Users-post-body',
    );
  });

  it('handles path with parameter', () => {
    expect(pathToName(['paths', '/users/{id}/posts', 'get', 'properties', 'query'])).toBe(
      'UsersIdPosts-get-query',
    );
  });

  it('handles path without properties', () => {
    expect(pathToName(['paths', '/event', 'get'])).toBe('Event-get');
  });

  // ── Webhooks ──

  it('handles webhooks', () => {
    expect(pathToName(['webhooks', 'onEvent', 'post', 'properties', 'body'])).toBe(
      'onEvent-post-body',
    );
  });

  // ── Component types beyond schemas ──

  it('handles component parameters', () => {
    expect(pathToName(['components', 'parameters', 'UserId'])).toBe('UserId');
  });

  it('handles component requestBodies', () => {
    expect(pathToName(['components', 'requestBodies', 'CreateUser', 'properties', 'name'])).toBe(
      'CreateUser-name',
    );
  });

  // ── Encoded characters ──

  it('handles URI-encoded names', () => {
    expect(pathToName(['components', 'schemas', 'My%20Schema'])).toBe('My Schema');
  });

  // ── Anchor option ──

  it('uses anchor for component schema', () => {
    expect(
      pathToName(['components', 'schemas', 'User', 'properties', 'address'], {
        anchor: 'UserDTO',
      }),
    ).toBe('UserDTO-address');
  });

  it('uses anchor for paths', () => {
    expect(
      pathToName(['paths', '/event', 'get', 'properties', 'query'], {
        anchor: 'event.subscribe',
      }),
    ).toBe('event.subscribe-query');
  });

  it('uses anchor and preserves structural suffix', () => {
    expect(
      pathToName(['components', 'schemas', 'Pet', 'additionalProperties'], {
        anchor: 'PetMap',
      }),
    ).toBe('PetMap-Value');
  });

  it('uses anchor with deeply nested properties', () => {
    expect(
      pathToName(['components', 'schemas', 'User', 'properties', 'address', 'properties', 'city'], {
        anchor: 'UserInput',
      }),
    ).toBe('UserInput-address-city');
  });

  it('uses anchor for unknown root', () => {
    expect(pathToName(['foo', 'bar', 'baz'], { anchor: 'Root' })).toBe('Root');
  });
});
