import * as Handlebars from 'handlebars/runtime';

import { registerHandlebarHelpers } from './registerHandlebarHelpers';

describe('registerHandlebarHelpers', () => {
    it('should register the helpers', () => {
        registerHandlebarHelpers();
        const helpers = Object.keys(Handlebars.helpers);
        expect(helpers).toContain('equals');
        expect(helpers).toContain('notEquals');
        expect(helpers).toContain('containsSpaces');
    });

    describe('containsSpaces', () => {
        it('should return true when string with spaces is passed', () => {
            registerHandlebarHelpers();
            const containsSpaces = Handlebars.helpers['containsSpaces'];
            const result = containsSpaces('I have spaces insideme');
            expect(result).toBeTruthy();
        });

        it('should return false when string without spaces is passed', () => {
            registerHandlebarHelpers();
            const containsSpaces = Handlebars.helpers['containsSpaces'];
            const result = containsSpaces('Ihavespacesinsideme');
            expect(result).toBeFalsy();
        });
    });
});
