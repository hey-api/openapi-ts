import path from 'node:path';

import { $RefParser } from '..';
import { getSpecsPath } from './utils';

describe('bundle', () => {
  it('handles circular reference with description', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'circular-ref-with-description.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });
    expect(schema).toEqual({
      schemas: {
        Bar: {
          $ref: '#/schemas/Foo',
          description: 'ok',
        },
        Foo: {
          $ref: '#/schemas/Bar',
        },
      },
    });
  });

  it('bundles multiple references to the same file correctly', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'multiple-refs.json',
    );
    const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

    // Both parameters should now be $ref to the same internal definition
    const firstParam = schema.paths['/test1/{pathId}'].get.parameters[0];
    const secondParam = schema.paths['/test2/{pathId}'].get.parameters[0];

    // The $ref should match the output structure in file_context_0
    expect(firstParam.$ref).toBe('#/components/parameters/path-parameter_pathId');
    expect(secondParam.$ref).toBe('#/components/parameters/path-parameter_pathId');

    // The referenced parameter should exist and match the expected structure
    expect(schema.components).toBeDefined();
    expect(schema.components.parameters).toBeDefined();
    expect(schema.components.parameters['path-parameter_pathId']).toEqual({
      in: 'path',
      name: 'pathId',
      required: true,
      schema: {
        description: 'Unique identifier for the path',
        format: 'uuid',
        type: 'string',
      },
    });
  });

  it('updates discriminator.mapping values when bundling multi-file schemas', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'discriminator-multi-file.json',
    );
    const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

    // The external schemas should be hoisted into components/schemas with file prefix
    const schemas = schema.components.schemas;
    expect(schemas['discriminator-providers_JetBrainsProviderConfigResponse']).toBeDefined();
    expect(schemas['discriminator-providers_OpenAIProviderConfigResponse']).toBeDefined();

    // Find the bundled AIProviderConfigResponse (hoisted from external file)
    const aiProvider = schemas['discriminator-providers_AIProviderConfigResponse'];
    expect(aiProvider).toBeDefined();
    expect(aiProvider.discriminator).toBeDefined();
    expect(aiProvider.discriminator.mapping).toBeDefined();

    // The discriminator.mapping values should be updated to match the rewritten $ref paths
    const mapping = aiProvider.discriminator.mapping;
    const oneOfRefs = aiProvider.oneOf.map((item: any) => item.$ref);

    // mapping values should point to the same schemas as oneOf $refs
    expect(oneOfRefs).toContain(mapping.jetbrains);
    expect(oneOfRefs).toContain(mapping.openai);

    // mapping values should use the prefixed schema names, not the original ones
    expect(mapping.jetbrains).toContain('discriminator-providers_JetBrainsProviderConfigResponse');
    expect(mapping.openai).toContain('discriminator-providers_OpenAIProviderConfigResponse');
  });

  it('does not modify discriminator.mapping for single-file schemas', async () => {
    const refParser = new $RefParser();
    const schema = (await refParser.bundle({
      pathOrUrlOrSchema: {
        components: {
          schemas: {
            Bar: {
              properties: { type: { enum: ['bar'], type: 'string' } },
              type: 'object',
            },
            Baz: {
              properties: { type: { enum: ['baz'], type: 'string' } },
              type: 'object',
            },
            Foo: {
              discriminator: {
                mapping: {
                  bar: '#/components/schemas/Bar',
                  baz: '#/components/schemas/Baz',
                },
                propertyName: 'type',
              },
              oneOf: [{ $ref: '#/components/schemas/Bar' }, { $ref: '#/components/schemas/Baz' }],
            },
          },
        },
        openapi: '3.0.3',
      },
    })) as any;

    const mapping = schema.components.schemas.Foo.discriminator.mapping;
    // Mapping values should remain unchanged for single-file schemas
    expect(mapping.bar).toContain('Bar');
    expect(mapping.baz).toContain('Baz');
    // The mapping keys (discriminator values) should be preserved
    expect(Object.keys(mapping)).toEqual(['bar', 'baz']);
  });
});
