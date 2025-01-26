import { describe, expect, it } from 'vitest';

import { createClient } from '../src/index';
import { Performance } from '../src/utils/performance';

const V3_SPEC_PATH = './test/spec/v3.json';
const V3_1_X_SPEC_PATH = './test/spec/3.1.x/full.json';

const OUTPUT_PREFIX = './test/generated/';

const toOutputPath = (name: string) => `${OUTPUT_PREFIX}${name}/`;

describe('performance', () => {
  it('creates client under 1000ms', async () => {
    Performance.clear();

    await createClient({
      input: V3_SPEC_PATH,
      output: toOutputPath('perf'),
      plugins: ['@hey-api/client-fetch'],
    });

    Performance.measure('createClient');
    const measures = Performance.getEntriesByName('createClient');

    expect(measures[0]!.duration).toBeLessThanOrEqual(1000);
  });

  it('parses spec under 500ms', async () => {
    Performance.clear();

    await createClient({
      input: V3_SPEC_PATH,
      output: toOutputPath('perf'),
      plugins: ['@hey-api/client-fetch'],
    });

    Performance.measure('parser');
    const measures = Performance.getEntriesByName('parser');

    expect(measures[0]!.duration).toBeLessThanOrEqual(500);
  });

  it('parses spec under 500ms (experimental)', async () => {
    Performance.clear();

    await createClient({
      input: V3_1_X_SPEC_PATH,
      output: toOutputPath('perf'),
      plugins: ['@hey-api/client-fetch'],
    });

    Performance.measure('parser');
    const measures = Performance.getEntriesByName('parser');

    expect(measures[0]!.duration).toBeLessThanOrEqual(500);
  });
});
