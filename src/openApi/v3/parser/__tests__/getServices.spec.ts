import { getServices } from '../getServices';

describe('getServices', () => {
    it('should create a unnamed service if tags are empty', () => {
        const options: Parameters<typeof getServices>[1] = {
            input: '',
            operationId: true,
            output: '',
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
