import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { isSubDirectory } from '../isSubdirectory';

describe('isSubDirectory', () => {
    it.each([
        ['/', '/', false],
        ['.', '.', false],
        ['./project', './project', false],
        ['./project', '../', false],
        ['./project', '../../', false],
        ['./', './output', true],
        ['./', '../output', false],
        ['./', '../../../../../output', false],
    ])('isSubDirectory(%s, %s) -> %s', (a, b, expected) => {
        const result = isSubDirectory(path.resolve(a), path.resolve(b));
        expect(result).toBe(expected);
    });
});
