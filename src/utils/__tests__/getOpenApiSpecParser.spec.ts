import { getOpenApiSpecParser } from '../getOpenApiSpecParser';

jest.mock('../../openApi/v2', () => ({
    parse: 'parseV2',
}));
jest.mock('../../openApi/v3', () => ({
    parse: 'parseV3',
}));

describe('getOpenApiSpecParser', () => {
    it('returns v2 parser', () => {
        expect(getOpenApiSpecParser({ openapi: '2' })).toEqual('parseV2');
        expect(getOpenApiSpecParser({ openapi: '2.0' })).toEqual('parseV2');

        expect(getOpenApiSpecParser({ swagger: '2' })).toEqual('parseV2');
        expect(getOpenApiSpecParser({ swagger: '2.0' })).toEqual('parseV2');
    });

    it('returns v3 parser', () => {
        expect(getOpenApiSpecParser({ openapi: '3' })).toEqual('parseV3');
        expect(getOpenApiSpecParser({ openapi: '3.0' })).toEqual('parseV3');
        expect(getOpenApiSpecParser({ openapi: '3.1.0' })).toEqual('parseV3');

        expect(getOpenApiSpecParser({ swagger: '3' })).toEqual('parseV3');
        expect(getOpenApiSpecParser({ swagger: '3.0' })).toEqual('parseV3');
        expect(getOpenApiSpecParser({ swagger: '3.1.0' })).toEqual('parseV3');
    });

    it('throws on unknown version', () => {
        expect(() => getOpenApiSpecParser({})).toThrow('Unsupported Open API version: "undefined"');
        expect(() => getOpenApiSpecParser({ swagger: '4.0' })).toThrow('Unsupported Open API version: "4.0"');
    });
});
