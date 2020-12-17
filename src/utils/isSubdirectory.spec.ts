import { resolve } from 'path';

import { isSubDirectory } from './isSubdirectory';

describe('isSubDirectory', () => {
    it('should return correct result', () => {
        expect(isSubDirectory(resolve('/'), resolve('/'))).toBeFalsy();
        expect(isSubDirectory(resolve('.'), resolve('.'))).toBeFalsy();
        expect(isSubDirectory(resolve('./project'), resolve('./project'))).toBeFalsy();
        expect(isSubDirectory(resolve('./project'), resolve('../'))).toBeFalsy();
        expect(isSubDirectory(resolve('./project'), resolve('../../'))).toBeFalsy();
        expect(isSubDirectory(resolve('./'), resolve('./output'))).toBeTruthy();
        expect(isSubDirectory(resolve('./'), resolve('../output'))).toBeTruthy();
    });
});
