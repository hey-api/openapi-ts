import path from 'node:path';

import { $RefParser } from '..';
import Pointer from '../pointer';
import { getSpecsPath } from './utils';

describe('pointer', () => {
  it('round-trips generic and unicode component names through join and parse', () => {
    const genericRef = Pointer.join('#/components/schemas', 'PaginatedListItems<ClientResponse>');
    const unicodeRef = Pointer.join('#/components/schemas', 'Überschrift');

    expect(genericRef).toBe('#/components/schemas/PaginatedListItems%3CClientResponse%3E');
    expect(unicodeRef).toBe('#/components/schemas/%C3%9Cberschrift');

    expect(Pointer.parse(genericRef)).toEqual([
      'components',
      'schemas',
      'PaginatedListItems<ClientResponse>',
    ]);
    expect(Pointer.parse(unicodeRef)).toEqual(['components', 'schemas', 'Überschrift']);
  });

  it('preserves JSON Pointer escaping for path-like tokens while decoding them on parse', () => {
    const joined = Pointer.join('#/paths', '/foo');

    expect(joined).toBe('#/paths/~1foo');
    expect(Pointer.parse(joined)).toEqual(['paths', '/foo']);
  });

  it('inlines internal JSON Pointer refs under #/paths/ for OpenAPI bundling', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'openapi-paths-ref.json',
    );
    const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

    // The GET endpoint should have its schema defined inline
    const getSchema = schema.paths['/foo'].get.responses['200'].content['application/json'].schema;
    expect(getSchema.$ref).toBeUndefined();
    expect(getSchema.type).toBe('object');
    expect(getSchema.properties.bar.type).toBe('string');

    // The POST endpoint should have its schema inlined (copied) instead of a $ref
    const postSchema =
      schema.paths['/foo'].post.responses['200'].content['application/json'].schema;
    expect(postSchema.$ref).toBe(
      '#/paths/~1foo/get/responses/200/content/application~1json/schema',
    );
    expect(postSchema.type).toBeUndefined();
    expect(postSchema.properties?.bar?.type).toBeUndefined();

    // Both schemas should be identical objects
    expect(postSchema).not.toBe(getSchema);
  });
});
