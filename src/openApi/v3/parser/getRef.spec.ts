import { getRef } from './getRef';

describe('getRef', () => {
    it('should produce correct result', () => {
        expect(
            getRef(
                {
                    openapi: '3.0',
                    info: {
                        title: 'dummy',
                        version: '1.0',
                    },
                    paths: {},
                    servers: [
                        {
                            url: 'https://localhost:8080/api',
                        },
                    ],
                    components: {
                        schemas: {
                            Example: {
                                description: 'This is an Example model ',
                                type: 'integer',
                            },
                        },
                    },
                },
                {
                    $ref: '#/components/schemas/Example',
                }
            )
        ).toEqual({
            description: 'This is an Example model ',
            type: 'integer',
        });
    });

    it('should produce correct result for encoded ref path', () => {
        expect(
            getRef(
                {
                    openapi: '3.0',
                    info: {
                        title: 'dummy',
                        version: '1.0',
                    },
                    paths: {
                        '/api/user/{id}': {
                            description: 'This is an Example path',
                        },
                    },
                },
                {
                    $ref: '#/paths/~1api~1user~1%7Bid%7D',
                }
            )
        ).toEqual({
            description: 'This is an Example path',
        });
    });
});
