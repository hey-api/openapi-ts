import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { $RefParser } from '..';
import { getSpecsPath } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getSnapshotsPath = () => path.join(__dirname, '__snapshots__');
const getTempSnapshotsPath = () => path.join(__dirname, '.gen', 'snapshots');

/**
 * Helper function to compare a bundled schema with a snapshot file.
 * Handles writing the schema to a temp file and comparing with the snapshot.
 *
 * @param schema - The bundled schema to compare
 * @param snapshotName - The name of the snapshot file (e.g., 'circular-ref-with-description.json')
 */
const expectBundledSchemaToMatchSnapshot = async (schema: unknown, snapshotName: string) => {
  const outputPath = path.join(getTempSnapshotsPath(), snapshotName);
  const snapshotPath = path.join(getSnapshotsPath(), snapshotName);

  // Ensure directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Write the bundled result
  const content = JSON.stringify(schema, null, 2);
  fs.writeFileSync(outputPath, content);

  // Compare with snapshot
  await expect(content).toMatchFileSnapshot(snapshotPath);
};

describe('bundle', () => {
  it('handles circular reference with description', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'circular-ref-with-description.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    await expectBundledSchemaToMatchSnapshot(schema, 'circular-ref-with-description.json');
  });

  it('bundles multiple references to the same file correctly', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'multiple-refs.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    await expectBundledSchemaToMatchSnapshot(schema, 'multiple-refs.json');
  });

  it('hoists sibling schemas from external files', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'main-with-external-siblings.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    await expectBundledSchemaToMatchSnapshot(schema, 'main-with-external-siblings.json');
  });

  it('hoists sibling schemas from YAML files with versioned names (Redfish-like)', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'redfish-like.yaml',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    await expectBundledSchemaToMatchSnapshot(schema, 'redfish-like.json');
  });

  describe('sibling schema resolution', () => {
    const specsDir = path.join(getSpecsPath(), 'json-schema-ref-parser');

    const findSchemaByValue = (
      schemas: Record<string, any>,
      predicate: (value: any) => boolean,
    ): [string, any] | undefined => {
      for (const [name, value] of Object.entries(schemas)) {
        if (predicate(value)) {
          return [name, value];
        }
      }
      return undefined;
    };

    it('hoists sibling schemas through a bare $ref wrapper chain', async () => {
      const refParser = new $RefParser();
      const pathOrUrlOrSchema = path.join(specsDir, 'sibling-schema-root.json');
      const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

      expect(schema.components).toBeDefined();
      expect(schema.components.schemas).toBeDefined();

      const schemas = schema.components.schemas;

      const mainSchema = findSchemaByValue(
        schemas,
        (v) => v.type === 'object' && v.properties?.name,
      );
      expect(mainSchema).toBeDefined();
      const [mainName, mainValue] = mainSchema!;
      expect(mainValue.type).toBe('object');
      expect(mainValue.properties.name).toEqual({ type: 'string' });

      const enumSchema = findSchemaByValue(
        schemas,
        (v) => Array.isArray(v.enum) && v.enum.includes('active'),
      );
      expect(enumSchema).toBeDefined();
      const [enumName, enumValue] = enumSchema!;
      expect(enumValue.type).toBe('string');
      expect(enumValue.enum).toEqual(['active', 'inactive', 'pending']);

      // The main schema's status property should reference the hoisted enum
      expect(mainValue.properties.status.$ref).toBe(`#/components/schemas/${enumName}`);

      // The root path's schema ref should point to the hoisted main schema
      const rootRef = schema.paths['/test'].get.responses['200'].content['application/json'].schema;
      expect(rootRef.$ref).toBe(`#/components/schemas/${mainName}`);
    });

    it('hoists sibling schemas through an extended $ref wrapper chain', async () => {
      const refParser = new $RefParser();
      const pathOrUrlOrSchema = path.join(specsDir, 'sibling-schema-extended-root.json');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

        expect(schema.components).toBeDefined();
        expect(schema.components.schemas).toBeDefined();

        const schemas = schema.components.schemas;

        // The main schema should be hoisted (with the extra description merged in)
        const mainSchema = findSchemaByValue(
          schemas,
          (v) =>
            v.description === 'Wrapper that extends the versioned schema' ||
            (v.type === 'object' && v.properties?.name),
        );
        expect(mainSchema).toBeDefined();

        // The sibling enum must also be hoisted (this was the bug — it was lost before the fix)
        const enumSchema = findSchemaByValue(
          schemas,
          (v) => Array.isArray(v.enum) && v.enum.includes('active'),
        );
        expect(enumSchema).toBeDefined();
        const [, enumValue] = enumSchema!;
        expect(enumValue.type).toBe('string');
        expect(enumValue.enum).toEqual(['active', 'inactive', 'pending']);

        // No "Skipping unresolvable $ref" warnings should have been emitted
        const unresolvableWarnings = warnSpy.mock.calls.filter(
          (args) => typeof args[0] === 'string' && args[0].includes('Skipping unresolvable $ref'),
        );
        expect(unresolvableWarnings).toHaveLength(0);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('hoists sibling schemas from a direct reference (no wrapper)', async () => {
      const refParser = new $RefParser();
      const pathOrUrlOrSchema = path.join(specsDir, 'sibling-schema-direct-root.json');
      const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

      expect(schema.components).toBeDefined();
      expect(schema.components.schemas).toBeDefined();

      const schemas = schema.components.schemas;

      const mainSchema = findSchemaByValue(
        schemas,
        (v) => v.type === 'object' && v.properties?.name,
      );
      expect(mainSchema).toBeDefined();

      const enumSchema = findSchemaByValue(
        schemas,
        (v) => Array.isArray(v.enum) && v.enum.includes('active'),
      );
      expect(enumSchema).toBeDefined();
      const [enumName, enumValue] = enumSchema!;
      expect(enumValue.enum).toEqual(['active', 'inactive', 'pending']);

      const [, mainValue] = mainSchema!;
      expect(mainValue.properties.status.$ref).toBe(`#/components/schemas/${enumName}`);
    });

    it('hoists multiple sibling schemas through an extended wrapper', async () => {
      const refParser = new $RefParser();
      const pathOrUrlOrSchema = path.join(specsDir, 'sibling-schema-multi-root.json');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

        expect(schema.components).toBeDefined();
        expect(schema.components.schemas).toBeDefined();

        const schemas = schema.components.schemas;

        const mainSchema = findSchemaByValue(
          schemas,
          (v) => v.type === 'object' && v.properties?.health,
        );
        expect(mainSchema).toBeDefined();

        const statusEnum = findSchemaByValue(
          schemas,
          (v) => Array.isArray(v.enum) && v.enum.includes('enabled'),
        );
        expect(statusEnum).toBeDefined();
        expect(statusEnum![1].enum).toEqual(['enabled', 'disabled', 'standby']);

        const healthEnum = findSchemaByValue(
          schemas,
          (v) => Array.isArray(v.enum) && v.enum.includes('ok'),
        );
        expect(healthEnum).toBeDefined();
        expect(healthEnum![1].enum).toEqual(['ok', 'warning', 'critical']);

        const [, mainValue] = mainSchema!;
        expect(mainValue.properties.status.$ref).toBe(`#/components/schemas/${statusEnum![0]}`);
        expect(mainValue.properties.health.$ref).toBe(`#/components/schemas/${healthEnum![0]}`);

        const unresolvableWarnings = warnSpy.mock.calls.filter(
          (args) => typeof args[0] === 'string' && args[0].includes('Skipping unresolvable $ref'),
        );
        expect(unresolvableWarnings).toHaveLength(0);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('handles multiple external files with same-named sibling schemas', async () => {
      const refParser = new $RefParser();
      const pathOrUrlOrSchema = path.join(specsDir, 'sibling-schema-collision-root.json');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        const schema = (await refParser.bundle({ pathOrUrlOrSchema })) as any;

        expect(schema.components).toBeDefined();
        expect(schema.components.schemas).toBeDefined();

        const schemas = schema.components.schemas;
        const schemaNames = Object.keys(schemas);

        const mainSchemaKey = schemaNames.find((name) => name.includes('MainSchema'));
        const otherSchemaKey = schemaNames.find((name) => name.includes('OtherSchema'));

        expect(mainSchemaKey).toBeDefined();
        expect(otherSchemaKey).toBeDefined();

        const statusSchemas = schemaNames.filter((name) => name.includes('Status'));
        expect(statusSchemas.length).toBeGreaterThanOrEqual(2);

        const statusValues = statusSchemas.map((name) => schemas[name]);
        const stringStatus = statusValues.find((v: any) => v.type === 'string');
        const integerStatus = statusValues.find((v: any) => v.type === 'integer');

        expect(stringStatus).toBeDefined();
        expect(integerStatus).toBeDefined();
        expect(stringStatus!.enum).toEqual(['active', 'inactive']);
        expect(integerStatus!.enum).toEqual([0, 1, 2]);

        const mainSchemaValue = schemas[mainSchemaKey!];
        const mainStatusRef = mainSchemaValue.properties.status.$ref;
        expect(mainStatusRef).toMatch(/^#\/components\/schemas\/.*Status/);

        const referencedStatus = schemas[mainStatusRef.replace('#/components/schemas/', '')];
        expect(referencedStatus).toBeDefined();
        expect(referencedStatus.type).toBe('string');
        expect(referencedStatus.enum).toEqual(['active', 'inactive']);

        const otherSchemaValue = schemas[otherSchemaKey!];
        const otherStatusRef = otherSchemaValue.properties.code.$ref;
        expect(otherStatusRef).toMatch(/^#\/components\/schemas\/.*Status/);

        const referencedOtherStatus = schemas[otherStatusRef.replace('#/components/schemas/', '')];
        expect(referencedOtherStatus).toBeDefined();
        expect(referencedOtherStatus.type).toBe('integer');
        expect(referencedOtherStatus.enum).toEqual([0, 1, 2]);

        const unresolvableWarnings = warnSpy.mock.calls.filter(
          (args) => typeof args[0] === 'string' && args[0].includes('Skipping unresolvable $ref'),
        );
        expect(unresolvableWarnings).toHaveLength(0);
      } finally {
        warnSpy.mockRestore();
      }
    });
  });
});
