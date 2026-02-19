import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { $RefParser } from '..';
import { getSpecsPath } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getSnapshotsPath = () => path.join(__dirname, '__snapshots__');
const getTempSnapshotsPath = () => path.join(__dirname, '.gen', 'snapshots');

describe('bundle', () => {
  it('handles circular reference with description', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'circular-ref-with-description.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    const outputPath = path.join(getTempSnapshotsPath(), 'circular-ref-with-description.json');
    const snapshotPath = path.join(getSnapshotsPath(), 'circular-ref-with-description.json');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the bundled result
    const content = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, content);

    // Compare with snapshot
    await expect(content).toMatchFileSnapshot(snapshotPath);
  });

  it('bundles multiple references to the same file correctly', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'multiple-refs.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    const outputPath = path.join(getTempSnapshotsPath(), 'multiple-refs.json');
    const snapshotPath = path.join(getSnapshotsPath(), 'multiple-refs.json');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the bundled result
    const content = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, content);

    // Compare with snapshot
    await expect(content).toMatchFileSnapshot(snapshotPath);
  });

  it('hoists sibling schemas from external files', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'main-with-external-siblings.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    const outputPath = path.join(getTempSnapshotsPath(), 'main-with-external-siblings.json');
    const snapshotPath = path.join(getSnapshotsPath(), 'main-with-external-siblings.json');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the bundled result
    const content = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, content);

    // Compare with snapshot
    await expect(content).toMatchFileSnapshot(snapshotPath);
  });

  it('hoists sibling schemas from YAML files with versioned names (Redfish-like)', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'redfish-like.yaml',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    const outputPath = path.join(getTempSnapshotsPath(), 'redfish-like.json');
    const snapshotPath = path.join(getSnapshotsPath(), 'redfish-like.json');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the bundled result
    const content = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, content);

    // Compare with snapshot
    await expect(content).toMatchFileSnapshot(snapshotPath);
  });

  it('fixes cross-file references (schemas in different external files)', async () => {
    const refParser = new $RefParser();
    const pathOrUrlOrSchema = path.join(
      getSpecsPath(),
      'json-schema-ref-parser',
      'cross-file-ref-main.json',
    );
    const schema = await refParser.bundle({ pathOrUrlOrSchema });

    const outputPath = path.join(getTempSnapshotsPath(), 'cross-file-ref-main.json');
    const snapshotPath = path.join(getSnapshotsPath(), 'cross-file-ref-main.json');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the bundled result
    const content = JSON.stringify(schema, null, 2);
    fs.writeFileSync(outputPath, content);

    // Compare with snapshot
    await expect(content).toMatchFileSnapshot(snapshotPath);
  });
});
