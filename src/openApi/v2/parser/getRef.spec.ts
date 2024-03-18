import { describe, expect, it } from 'vitest';

import { getRef } from './getRef';

describe('getRef', () => {
    it('should produce correct result', () => {
        expect(
            getRef(
                {
                    swagger: '2.0',
                    info: {
                        title: 'dummy',
                        version: '1.0',
                    },
                    host: 'localhost:8080',
                    basePath: '/api',
                    schemes: ['http', 'https'],
                    paths: {},
                    definitions: {
                        Example: {
                            description: 'This is an Example model ',
                            type: 'integer',
                        },
                    },
                },
                {
                    $ref: '#/definitions/Example',
                }
            )
        ).toEqual({
            description: 'This is an Example model ',
            type: 'integer',
        });
    });
});
