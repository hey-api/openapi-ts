import { getModelTemplate } from './getModelTemplate';

describe('getModelTemplate', () => {
    it('should return generic for template type', () => {
        const template = getModelTemplate({
            $refs: [],
            base: 'Link',
            imports: ['Model'],
            isNullable: false,
            template: 'Model',
            type: 'Link<Model>',
        });
        expect(template).toEqual('<T>');
    });

    it('should return empty for primary type', () => {
        const template = getModelTemplate({
            $refs: [],
            base: 'string',
            imports: [],
            isNullable: false,
            template: null,
            type: 'string',
        });
        expect(template).toEqual('');
    });
});
