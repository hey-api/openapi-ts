import { describe, expect, it } from 'vitest';

import { getServices } from '../getServices';

describe('getServices', () => {
    it('should create a unnamed service if tags are empty', () => {
        const options: Parameters<typeof getServices>[1] = {
            client: 'fetch',
            debug: false,
            enums: false,
            experimental: false,
            exportCore: true,
            exportModels: true,
            exportServices: true,
            format: false,
            input: '',
            lint: false,
            operationId: false,
            output: '',
            postfixServices: 'Service',
            schemas: true,
            serviceResponse: 'body',
            useDateType: false,
            useOptions: true,
            write: false,
        };
        const services = getServices(
            {
                info: {
                    title: 'x',
                    version: '1',
                },
                paths: {
                    '/api/trips': {
                        get: {
                            responses: {
                                200: {
                                    description: 'x',
                                },
                                default: {
                                    description: 'default',
                                },
                            },
                            tags: [],
                        },
                    },
                },
                swagger: '2.0',
            },
            options
        );

        expect(services).toHaveLength(1);
        expect(services[0].name).toEqual('Default');
    });
});
