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

  it('hoists sibling schemas from YAML files with versioned names (Redfish-like)', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'redfish-like.yaml',
    );
    const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

    // Verify the main schema references are hoisted
    const systemsSchema =
      schema.paths['/redfish/v1/Systems'].get.responses['200'].content['application/json'].schema;
    expect(systemsSchema.$ref).toContain('ResolutionStep');

    const actionsSchema =
      schema.paths['/redfish/v1/Actions'].post.responses['200'].content['application/json'].schema;
    expect(actionsSchema.$ref).toContain('ActionParameters');

    // All three schemas from the external YAML should be hoisted
    expect(schema.components).toBeDefined();
    expect(schema.components.schemas).toBeDefined();

    const schemaKeys = Object.keys(schema.components.schemas);

    // ResolutionStep (directly referenced)
    const resolutionStepKey = schemaKeys.find(
      (k) => k.includes('ResolutionStep') && !k.includes('Type') && !k.includes('ActionParameters'),
    );
    expect(resolutionStepKey).toBeDefined();

    // ResolutionType (sibling, referenced by ResolutionStep and ActionParameters)
    const resolutionTypeKey = schemaKeys.find((k) => k.includes('ResolutionType'));
    expect(resolutionTypeKey).toBeDefined();
    expect(schema.components.schemas[resolutionTypeKey!]).toEqual({
      description: 'Types of resolution actions',
      enum: ['ContactVendor', 'ResetToDefaults', 'RetryOperation'],
      type: 'string',
    });

    // ActionParameters (directly referenced)
    const actionParamsKey = schemaKeys.find((k) => k.includes('ActionParameters'));
    expect(actionParamsKey).toBeDefined();

    // Verify that internal $refs in hoisted schemas point to hoisted locations
    const resolutionStep = schema.components.schemas[resolutionStepKey!];
    expect(resolutionStep.properties.ResolutionType.oneOf[0].$ref).toContain('ResolutionType');
    expect(resolutionStep.properties.ResolutionType.oneOf[0].$ref).toMatch(
      /^#\/components\/schemas\//,
    );

    const actionParams = schema.components.schemas[actionParamsKey!];
    expect(actionParams.properties.ActionType.$ref).toContain('ResolutionType');
    expect(actionParams.properties.ActionType.$ref).toMatch(/^#\/components\/schemas\//);
  });

  it('fixes cross-file references (schemas in different external files)', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'cross-file-ref-main.json',
    );
    const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

    // Both schemas should be hoisted
    expect(schema.components).toBeDefined();
    expect(schema.components.schemas).toBeDefined();

    const schemaKeys = Object.keys(schema.components.schemas);
    expect(schemaKeys.length).toBe(2);

    // Find the hoisted schemas
    const schemaAKey = schemaKeys.find((k) => k.includes('SchemaA'));
    const schemaBKey = schemaKeys.find((k) => k.includes('SchemaB'));

    expect(schemaAKey).toBeDefined();
    expect(schemaBKey).toBeDefined();

    // SchemaA should have a reference to SchemaB
    const schemaA = schema.components.schemas[schemaAKey!];
    expect(schemaA.properties.typeField.$ref).toBe(`#/components/schemas/${schemaBKey}`);

    // SchemaB should be the enum type
    const schemaB = schema.components.schemas[schemaBKey!];
    expect(schemaB).toEqual({
      enum: ['TypeA', 'TypeB', 'TypeC'],
      type: 'string',
    });

    // Verify no dangling refs exist
    const findDanglingRefs = (obj: any, schemas: any): string[] => {
      const dangling: string[] = [];
      const check = (o: any) => {
        if (!o || typeof o !== 'object') return;
        if (o.$ref && typeof o.$ref === 'string' && o.$ref.startsWith('#/components/schemas/')) {
          const schemaName = o.$ref.replace('#/components/schemas/', '');
          if (!schemas[schemaName]) {
            dangling.push(o.$ref);
          }
        }
        for (const value of Object.values(o)) {
          check(value);
        }
      };
      check(obj);
      return dangling;
    };

    const danglingRefs = findDanglingRefs(schema, schema.components.schemas);
    expect(danglingRefs).toEqual([]);
  });
});
