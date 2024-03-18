import { describe, expect, it } from 'vitest';

import { getServiceVersion } from './getServiceVersion';

describe('getServiceVersion', () => {
    it('should produce correct result', () => {
        expect(getServiceVersion('1.0')).toEqual('1.0');
        expect(getServiceVersion('v1.0')).toEqual('1.0');
        expect(getServiceVersion('V1.0')).toEqual('1.0');
    });
});
