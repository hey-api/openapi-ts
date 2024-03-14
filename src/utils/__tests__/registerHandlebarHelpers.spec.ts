import Handlebars from 'handlebars/runtime';

import { HttpClient } from '../../HttpClient';
import { registerHandlebarHelpers } from '../registerHandlebarHelpers';

describe('registerHandlebarHelpers', () => {
    it('should register the helpers', () => {
        registerHandlebarHelpers(
            {
                info: {
                    title: '',
                    version: '',
                },
                openapi: '',
                paths: {},
            },
            {
                httpClient: HttpClient.FETCH,
                serviceResponse: 'body',
                useOptions: false,
            }
        );
        const helpers = Object.keys(Handlebars.helpers);
        expect(helpers).toContain('camelCase');
        expect(helpers).toContain('debugThis');
        expect(helpers).toContain('enumKey');
        expect(helpers).toContain('enumName');
        expect(helpers).toContain('enumUnionType');
        expect(helpers).toContain('enumValue');
        expect(helpers).toContain('equals');
        expect(helpers).toContain('escapeComment');
        expect(helpers).toContain('escapeDescription');
        expect(helpers).toContain('escapeNewline');
        expect(helpers).toContain('exactArray');
        expect(helpers).toContain('ifdef');
        expect(helpers).toContain('ifOperationDataOptional');
        expect(helpers).toContain('intersection');
        expect(helpers).toContain('modelUnionType');
        expect(helpers).toContain('nameOperationDataType');
        expect(helpers).toContain('notEquals');
        expect(helpers).toContain('useDateType');
    });
});
