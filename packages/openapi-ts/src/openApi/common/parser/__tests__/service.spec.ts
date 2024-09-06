import { describe, expect, it } from 'vitest';

import { getServiceVersion } from '../service';

describe('getServiceVersion', () => {
  it.each([
    { expected: '1.0', input: '1.0' },
    { expected: '1.2', input: 'v1.2' },
    { expected: '2.4', input: 'V2.4' },
  ])('should get $expected when version is $input', ({ input, expected }) => {
    expect(getServiceVersion(input)).toEqual(expected);
  });
});
