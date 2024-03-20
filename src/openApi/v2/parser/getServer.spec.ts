import { describe, expect, it } from 'vitest';

import { getServer } from './getServer';

describe('getServer', () => {
    it('should produce correct result', () => {
        expect(
            getServer({
                swagger: '2.0',
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                host: 'localhost:8080',
                basePath: '/api',
                schemes: ['http', 'https'],
                paths: {},
            })
        ).toEqual('http://localhost:8080/api');
    });
});
