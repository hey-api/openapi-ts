import { getServices } from './getServices';

describe('getServices', () => {
    it('should create a unnamed service if tags are empty', () => {
        const services = getServices({
            openapi: '3',
            info: { title: 'x', version: '1' },
            paths: {
                '/api/trips': {
                    get: { tags: [], responses: { 200: { description: 'X' }, default: { description: 'default' } } },
                },
            },
        });

        expect(services).toHaveLength(1);
        expect(services[0].name).toEqual('Unnamed');
    });
});
