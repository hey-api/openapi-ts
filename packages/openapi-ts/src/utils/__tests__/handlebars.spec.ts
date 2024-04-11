import Handlebars from 'handlebars/runtime';
import { describe, expect, it } from 'vitest';

import { setConfig } from '../config';
import { registerHandlebarHelpers, registerHandlebarTemplates } from '../handlebars';

describe('registerHandlebarHelpers', () => {
    it('should register the helpers', () => {
        setConfig({
            client: 'fetch',
            debug: false,
            dryRun: false,
            enums: 'javascript',
            exportCore: true,
            exportModels: true,
            exportServices: true,
            format: true,
            input: '',
            lint: false,
            operationId: true,
            output: '',
            postfixServices: '',
            schemas: true,
            serviceResponse: 'body',
            useDateType: false,
            useOptions: false,
        });
        registerHandlebarHelpers();
        const helpers = Object.keys(Handlebars.helpers);
        expect(helpers).toContain('camelCase');
        expect(helpers).toContain('dataDestructure');
        expect(helpers).toContain('dataParameters');
        expect(helpers).toContain('equals');
        expect(helpers).toContain('escapeComment');
        expect(helpers).toContain('escapeDescription');
        expect(helpers).toContain('ifdef');
        expect(helpers).toContain('ifOperationDataOptional');
        expect(helpers).toContain('modelIsRequired');
        expect(helpers).toContain('nameOperationDataType');
        expect(helpers).toContain('notEquals');
    });
});

describe('registerHandlebarTemplates', () => {
    it('should return correct templates', () => {
        setConfig({
            client: 'fetch',
            debug: false,
            dryRun: false,
            enums: 'javascript',
            exportCore: true,
            exportModels: true,
            exportServices: true,
            format: true,
            input: '',
            lint: false,
            operationId: true,
            output: '',
            postfixServices: '',
            schemas: true,
            serviceResponse: 'body',
            useDateType: false,
            useOptions: false,
        });
        const templates = registerHandlebarTemplates();
        expect(templates.exports.service).toBeDefined();
        expect(templates.core.settings).toBeDefined();
        expect(templates.core.apiError).toBeDefined();
        expect(templates.core.apiRequestOptions).toBeDefined();
        expect(templates.core.apiResult).toBeDefined();
        expect(templates.core.request).toBeDefined();
    });
});
