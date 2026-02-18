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

  it('hoists sibling schemas from external files', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'main-with-external-siblings.json',
    );
    const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

    // Main schema should reference the hoisted schemas
    const resolutionStepSchema =
      schema.paths['/resolution'].get.responses['200'].content['application/json'].schema;
    expect(resolutionStepSchema.$ref).toBe(
      '#/components/schemas/external-with-siblings_ResolutionStep',
    );

    const actionInfoSchema =
      schema.paths['/action'].get.responses['200'].content['application/json'].schema;
    expect(actionInfoSchema.$ref).toBe('#/components/schemas/external-with-siblings_ActionInfo');

    // All schemas from the external file should be hoisted
    expect(schema.components).toBeDefined();
    expect(schema.components.schemas).toBeDefined();

    // ResolutionStep should be hoisted
    expect(schema.components.schemas['external-with-siblings_ResolutionStep']).toBeDefined();
    expect(
      schema.components.schemas['external-with-siblings_ResolutionStep'].properties.ResolutionType
        .oneOf[0].$ref,
    ).toBe('#/components/schemas/external-with-siblings_ResolutionType');

    // ResolutionType (sibling schema) should also be hoisted
    expect(schema.components.schemas['external-with-siblings_ResolutionType']).toBeDefined();
    expect(schema.components.schemas['external-with-siblings_ResolutionType']).toEqual({
      enum: ['ContactVendor', 'ResetToDefaults', 'RetryOperation'],
      type: 'string',
    });

    // ActionInfo (another sibling schema) should also be hoisted
    expect(schema.components.schemas['external-with-siblings_ActionInfo']).toBeDefined();
    expect(schema.components.schemas['external-with-siblings_ActionInfo']).toEqual({
      properties: {
        ActionId: {
          type: 'string',
        },
      },
      type: 'object',
    });
  });
});
