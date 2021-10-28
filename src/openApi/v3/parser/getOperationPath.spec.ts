import { getOperationPath } from './getOperationPath';

describe('getOperationPath', () => {
    it('should produce correct result', () => {
        expect(getOperationPath('/api/v{api-version}/list/{id}/{type}')).toEqual(
            '/api/v${OpenAPI.VERSION}/list/${id}/${type}'
        );
        expect(getOperationPath('/api/v{api-version}/list/{id}')).toEqual('/api/v${OpenAPI.VERSION}/list/${id}');
        expect(getOperationPath('/api/v1/list/{id}')).toEqual('/api/v1/list/${id}');
        expect(getOperationPath('/api/{foobar}')).toEqual('/api/${foobar}');
        expect(getOperationPath('/api/{fooBar}')).toEqual('/api/${fooBar}');
        expect(getOperationPath('/api/{foo-bar}')).toEqual('/api/${fooBar}');
        expect(getOperationPath('/api/{foo_bar}')).toEqual('/api/${fooBar}');
        expect(getOperationPath('/api/{foo.bar}')).toEqual('/api/${fooBar}');
        expect(getOperationPath('/api/{Foo-Bar}')).toEqual('/api/${fooBar}');
        expect(getOperationPath('/api/{FOO-BAR}')).toEqual('/api/${fooBar}');
    });
});
