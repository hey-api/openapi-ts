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
});
