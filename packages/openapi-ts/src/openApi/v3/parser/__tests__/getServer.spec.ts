import { describe, expect, it } from 'vitest';

import { getServer } from '../getServer';

describe('getServer', () => {
    it('should produce correct result', () => {
        expect(
            getServer({
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                openapi: '3.0',
                paths: {},
                servers: [
                    {
                        url: 'https://localhost:8080/api',
                    },
                ],
            })
        ).toEqual('https://localhost:8080/api');
    });

    it('should produce correct result with variables', () => {
        expect(
            getServer({
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                openapi: '3.0',
                paths: {},
                servers: [
                    {
                        url: '{scheme}://localhost:{port}/api',
                        variables: {
                            port: {
                                default: '8080',
                            },
                            scheme: {
                                default: 'https',
                            },
                        },
                    },
                ],
            })
        ).toEqual('https://localhost:8080/api');
    });
});
