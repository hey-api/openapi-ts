import path from 'node:path';

import { sync } from 'cross-spawn';
import { beforeAll,describe, expect, it } from 'vitest';

import { getSpecsPath } from '../../utils';

const specs = getSpecsPath();

describe('bin', () => {
  beforeAll(() => {});

  it('openapi-ts works', () => {
    const result = sync('openapi-ts', [
      '--input',
      path.resolve(specs, 'v3.json'),
      '--output',
      path.resolve(__dirname, '.gen'),
      '--dry-run',
      'true',
    ]);

    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  }, 60000);
});
