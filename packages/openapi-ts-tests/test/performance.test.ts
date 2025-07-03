import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { Performance } from '../../openapi-ts/src/utils/performance';

const V3_SPEC_PATH = path.resolve(__dirname, 'spec', 'v3.json');
const V3_1_X_SPEC_PATH = path.resolve(__dirname, 'spec', '3.1.x', 'full.yaml');

const toOutputPath = (name: string) =>
  path.resolve(__dirname, 'generated', name);

describe('performance', () => {
  it('creates client under 1500ms', async () => {
    Performance.clear();

    await createClient({
      input: V3_SPEC_PATH,
      logs: {
        level: 'silent',
      },
      output: toOutputPath('perf'),
      plugins: ['@hey-api/client-fetch'],
    });

    Performance.measure('createClient');
    const measures = Performance.getEntriesByName('createClient');

    expect(measures[0]!.duration).toBeLessThanOrEqual(1500);
  });

  it('parses spec under 1500ms', async () => {
    Performance.clear();

    await createClient({
      input: V3_SPEC_PATH,
      logs: {
        level: 'silent',
      },
      output: toOutputPath('perf'),
      plugins: ['@hey-api/client-fetch'],
    });

    Performance.measure('parser');
    const measures = Performance.getEntriesByName('parser');

    expect(measures[0]!.duration).toBeLessThanOrEqual(1500);
  });

  it('parses spec under 1500ms (experimental)', async () => {
    Performance.clear();

    await createClient({
      input: V3_1_X_SPEC_PATH,
      logs: {
        level: 'silent',
      },
      output: toOutputPath('perf'),
      plugins: ['@hey-api/client-fetch'],
    });

    Performance.measure('parser');
    const measures = Performance.getEntriesByName('parser');

    expect(measures[0]!.duration).toBeLessThanOrEqual(1500);
  });
});
