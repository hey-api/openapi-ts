import path from 'node:path';

import { $RefParser } from '..';
import { getSpecsPath } from './utils';

describe('pointer', () => {
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
