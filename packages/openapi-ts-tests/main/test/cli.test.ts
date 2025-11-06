import path from 'node:path';

import { sync } from 'cross-spawn';
import { describe, expect, it } from 'vitest';

import { getSpecsPath } from '../../utils';

const specs = getSpecsPath();

describe('bin', () => {
  it('openapi-ts works', () => {
    const result = sync('openapi-ts', [
      '--input',
      path.resolve(specs, '3.1.x', 'full.yaml'),
      '--output',
      path.resolve(__dirname, '.gen'),
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });
});
