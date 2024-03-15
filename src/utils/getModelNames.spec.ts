import type { Model } from '../client/interfaces/Model';
import { getModelNames } from './getModelNames';

describe('getModelNames', () => {
    it('should return sorted list', () => {
        const john: Model = {
            $refs: [],
            base: 'John',
            description: null,
            enum: [],
            enums: [],
            export: 'interface',
            imports: [],
            isDefinition: true,
            isNullable: false,
            isReadOnly: false,
            isRequired: false,
            link: null,
            name: 'John',
            properties: [],
            template: null,
            type: 'John',
        };
        const jane: Model = {
            $refs: [],
            base: 'Jane',
            description: null,
            enum: [],
            enums: [],
            export: 'interface',
            imports: [],
            isDefinition: true,
            isNullable: false,
            isReadOnly: false,
            isRequired: false,
            link: null,
            name: 'Jane',
            properties: [],
            template: null,
            type: 'Jane',
        };
        const doe: Model = {
            $refs: [],
            base: 'Doe',
            description: null,
            enum: [],
            enums: [],
            export: 'interface',
            imports: [],
            isDefinition: true,
            isNullable: false,
            isReadOnly: false,
            isRequired: false,
            link: null,
            name: 'Doe',
            properties: [],
            template: null,
            type: 'Doe',
        };
        const models: Model[] = [john, jane, doe];

        expect(getModelNames([])).toEqual([]);
        expect(getModelNames(models)).toEqual(['Doe', 'Jane', 'John']);
    });
});
