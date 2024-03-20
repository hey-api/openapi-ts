import { describe, expect, it } from 'vitest';

import { getServer } from './getServer';

describe('getServer', () => {
    it('should produce correct result', () => {
        expect(
            getServer({
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
            })
        ).toEqual('https://localhost:8080/api');
    });

    it('should produce correct result with variables', () => {
        expect(
            getServer({
                openapi: '3.0',
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                paths: {},
                servers: [
                    {
                        url: '{scheme}://localhost:{port}/api',
                        variables: {
                            scheme: {
                                default: 'https',
                            },
                            port: {
                                default: '8080',
                            },
                        },
                    },
                ],
            })
        ).toEqual('https://localhost:8080/api');
    });
});
