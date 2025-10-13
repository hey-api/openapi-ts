import { describe, expect, it } from 'vitest';

import { pathToSymbolResourceType } from '../meta';

describe('pathToSymbolResourceType', () => {
  it('returns schema for components/schemas', () => {
    expect(pathToSymbolResourceType(['components', 'schemas', 'Pet'])).toBe(
      'schema',
    );
  });

  it('returns parameter for components/parameters', () => {
    expect(
      pathToSymbolResourceType(['components', 'parameters', 'limit']),
    ).toBe('parameter');
  });

  it('returns requestBody for components/requestBodies', () => {
    expect(
      pathToSymbolResourceType(['components', 'requestBodies', 'Body']),
    ).toBe('requestBody');
  });

  it('returns operation for paths', () => {
    expect(pathToSymbolResourceType(['paths', '/pets', 'get'])).toBe(
      'operation',
    );
  });

  it('returns server for servers', () => {
    expect(pathToSymbolResourceType(['servers', 0])).toBe('server');
  });

  it('returns webhook for webhooks', () => {
    expect(pathToSymbolResourceType(['webhooks', 'onEvent'])).toBe('webhook');
  });

  it('returns undefined for unknown paths', () => {
    expect(
      pathToSymbolResourceType(['components', 'unknown', 'foo']),
    ).toBeUndefined();
    expect(pathToSymbolResourceType(['random', 'value'])).toBeUndefined();
    expect(pathToSymbolResourceType(['components'])).toBeUndefined();
    expect(pathToSymbolResourceType([])).toBeUndefined();
  });
});
