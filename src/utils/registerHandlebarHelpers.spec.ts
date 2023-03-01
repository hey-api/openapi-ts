import Handlebars from 'handlebars/runtime';

import { HttpClient } from '../HttpClient';
import { registerHandlebarHelpers } from './registerHandlebarHelpers';

describe('registerHandlebarHelpers', () => {
    it('should register the helpers', () => {
        registerHandlebarHelpers({
            httpClient: HttpClient.FETCH,
            useOptions: false,
            useUnionTypes: false,
        });
        const helpers = Object.keys(Handlebars.helpers);
        expect(helpers).toContain('ifdef');
        expect(helpers).toContain('equals');
        expect(helpers).toContain('notEquals');
        expect(helpers).toContain('containsSpaces');
        expect(helpers).toContain('union');
        expect(helpers).toContain('intersection');
        expect(helpers).toContain('enumerator');
        expect(helpers).toContain('escapeComment');
        expect(helpers).toContain('escapeDescription');
        expect(helpers).toContain('camelCase');
    });
});
