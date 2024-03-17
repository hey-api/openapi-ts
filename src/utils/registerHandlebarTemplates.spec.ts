import { registerHandlebarTemplates } from './registerHandlebarTemplates';

describe('registerHandlebarTemplates', () => {
    it('should return correct templates', () => {
        const templates = registerHandlebarTemplates(
            {
                info: {
                    title: '',
                    version: '',
                },
                openapi: '',
                paths: {},
            },
            {
                autoformat: true,
                client: 'fetch',
                enums: true,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                input: '',
                operationId: true,
                output: '',
                postfixModels: '',
                postfixServices: '',
                serviceResponse: 'body',
                useDateType: false,
                useOptions: false,
                write: true,
            }
        );
        expect(templates.index).toBeDefined();
        expect(templates.exports.model).toBeDefined();
        expect(templates.exports.schema).toBeDefined();
        expect(templates.exports.service).toBeDefined();
        expect(templates.core.settings).toBeDefined();
        expect(templates.core.apiError).toBeDefined();
        expect(templates.core.apiRequestOptions).toBeDefined();
        expect(templates.core.apiResult).toBeDefined();
        expect(templates.core.request).toBeDefined();
    });
});
