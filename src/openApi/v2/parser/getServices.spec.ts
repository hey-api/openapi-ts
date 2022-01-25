import { getServices } from './getServices';

describe('getServices', () => {
    it('should create a unnamed service if tags are empty', () => {
        const services = getServices({
            swagger: '2.0',
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
        });

        expect(services).toHaveLength(1);
        expect(services[0].name).toEqual('Default');
    });
});
