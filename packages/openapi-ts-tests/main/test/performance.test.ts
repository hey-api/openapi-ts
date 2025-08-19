import path from 'node:path';

import { createClient, Logger } from '@hey-api/openapi-ts';
import { beforeEach, describe, expect, it } from 'vitest';

import { getSpecsPath } from '../../utils';

const V3_SPEC_PATH = path.resolve(getSpecsPath(), 'v3.json');
const V3_1_X_SPEC_PATH = path.resolve(getSpecsPath(), '3.1.x', 'full.yaml');

const toOutputPath = (name: string) =>
  path.resolve(__dirname, 'generated', name);

describe('performance', () => {
  beforeEach(() => {
    performance.clearMarks();
    performance.clearMeasures();
  });

  it('creates client under 1500ms', async () => {
    const logger = new Logger();
    await createClient(
      {
        input: V3_SPEC_PATH,
        logs: {
          level: 'silent',
        },
        output: toOutputPath('perf'),
        plugins: ['@hey-api/client-fetch'],
      },
      logger,
    );

    const duration = logger.report()?.duration ?? 9999;
    expect(duration).toBeLessThanOrEqual(1500);
  });

  it('parses spec under 1500ms', async () => {
    const logger = new Logger();
    await createClient(
      {
        input: V3_SPEC_PATH,
        logs: {
          level: 'silent',
        },
        output: toOutputPath('perf'),
        plugins: ['@hey-api/client-fetch'],
      },
      logger,
    );

    const duration = logger.report()?.duration ?? 9999;
    expect(duration).toBeLessThanOrEqual(1500);
  });

  it('parses spec under 1500ms (experimental)', async () => {
    const logger = new Logger();
    await createClient(
      {
        input: V3_1_X_SPEC_PATH,
        logs: {
          level: 'silent',
        },
        output: toOutputPath('perf'),
        plugins: ['@hey-api/client-fetch'],
      },
      logger,
    );

    const duration = logger.report()?.duration ?? 9999;
    expect(duration).toBeLessThanOrEqual(1500);
  });
});
