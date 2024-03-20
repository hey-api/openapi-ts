import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { isSubDirectory } from '../isSubdirectory';

describe('isSubDirectory', () => {
    it('should return correct result', () => {
        expect(isSubDirectory(path.resolve('/'), path.resolve('/'))).toBeFalsy();
        expect(isSubDirectory(path.resolve('.'), path.resolve('.'))).toBeFalsy();
        expect(isSubDirectory(path.resolve('./project'), path.resolve('./project'))).toBeFalsy();
        expect(isSubDirectory(path.resolve('./project'), path.resolve('../'))).toBeFalsy();
        expect(isSubDirectory(path.resolve('./project'), path.resolve('../../'))).toBeFalsy();
        expect(isSubDirectory(path.resolve('./'), path.resolve('./output'))).toBeTruthy();
        expect(isSubDirectory(path.resolve('./'), path.resolve('../output'))).toBeTruthy();
    });
});
