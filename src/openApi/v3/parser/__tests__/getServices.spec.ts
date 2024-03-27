import { describe, expect, it } from 'vitest';

import { getServices } from '../getServices';

describe('getServices', () => {
    it('should create a unnamed service if tags are empty', () => {
        const options: Parameters<typeof getServices>[1] = {
            client: 'fetch',
            enums: false,
            exportCore: true,
            exportModels: true,
            exportSchemas: true,
            exportServices: true,
            format: false,
            input: '',
            lint: false,
            operationId: true,
            output: '',
            postfixModels: '',
            postfixServices: 'Service',
            serviceResponse: 'body',
            useDateType: false,
            useOptions: true,
            useLegacyEnums: false,
            write: false,
        };
        const services = getServices(
            {
                openapi: '3.0.0',
                info: {
                    title: 'x',
                    version: '1',
                },
                paths: {
                    '/api/trips': {
                        get: {
                            tags: [],
                            responses: {
                                200: {
                                    description: 'x',
                                },
                                default: {
                                    description: 'default',
                                },
                            },
                        },
                    },
                },
            },
            options
        );

        expect(services).toHaveLength(1);
        expect(services[0].name).toEqual('Default');
    });
});
