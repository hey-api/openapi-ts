import Handlebars from 'handlebars/runtime';
import { describe, expect, it } from 'vitest';

import { registerHandlebarHelpers, registerHandlebarTemplates } from '../handlebars';

describe('registerHandlebarHelpers', () => {
    it('should register the helpers', () => {
        registerHandlebarHelpers(
            {
                client: 'fetch',
                enums: true,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                format: true,
                input: '',
                lint: false,
                operationId: true,
                output: '',
                postfixModels: '',
                postfixServices: '',
                serviceResponse: 'body',
                useDateType: false,
                useLegacyEnums: false,
                useOptions: false,
                write: true,
            },
            {
                models: [],
                server: '',
                services: [],
                version: '',
            }
        );
        const helpers = Object.keys(Handlebars.helpers);
        expect(helpers).toContain('camelCase');
        expect(helpers).toContain('dataParameters');
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
        expect(helpers).toContain('operationDataType');
        expect(helpers).toContain('useDateType');
    });
});

describe('registerHandlebarTemplates', () => {
    it('should return correct templates', () => {
        const templates = registerHandlebarTemplates(
            {
                client: 'fetch',
                enums: true,
                exportCore: true,
                exportModels: true,
                exportSchemas: true,
                exportServices: true,
                format: true,
                input: '',
                lint: false,
                operationId: true,
                output: '',
                postfixModels: '',
                postfixServices: '',
                serviceResponse: 'body',
                useDateType: false,
                useLegacyEnums: false,
                useOptions: false,
                write: true,
            },
            {
                models: [],
                server: '',
                services: [],
                version: '',
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
