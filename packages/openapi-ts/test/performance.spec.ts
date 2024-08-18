import { describe, expect, it } from 'vitest';

import { createClient } from '../src/index';
import { Performance } from '../src/utils/performance';

const V3_SPEC_PATH = './test/spec/v3.json';

const OUTPUT_PREFIX = './test/generated/';

const toOutputPath = (name: string) => `${OUTPUT_PREFIX}${name}/`;

describe('performance', () => {
  it('creates client under 1000ms', async () => {
    Performance.clear();

    await createClient({
      client: '@hey-api/client-fetch',
      input: V3_SPEC_PATH,
      output: toOutputPath('perf'),
    });

    Performance.measure('createClient');
    const measures = Performance.getEntriesByName('createClient');

    expect(measures[0].duration).toBeLessThanOrEqual(1000);
  });

  it('parses spec under 500ms', async () => {
    Performance.clear();

    await createClient({
      client: '@hey-api/client-fetch',
      input: V3_SPEC_PATH,
      output: toOutputPath('perf'),
    });

    Performance.measure('parser');
    const measures = Performance.getEntriesByName('parser');

    expect(measures[0].duration).toBeLessThanOrEqual(500);
  });

  it('parses spec under 300ms (experimental)', async () => {
    Performance.clear();

    await createClient({
      client: '@hey-api/client-fetch',
      experimental_parser: true,
      input: V3_SPEC_PATH,
      output: toOutputPath('perf'),
    });

    Performance.measure('experimental_parser');
    const measures = Performance.getEntriesByName('experimental_parser');

    expect(measures[0].duration).toBeLessThanOrEqual(300);
  });
});
