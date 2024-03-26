import { describe, expect, it } from 'vitest';

import { stripNamespace } from '../stripNamespace';

describe('stripNamespace', () => {
    it('should strip namespace', () => {
        expect(stripNamespace('#/definitions/Item')).toEqual('Item');
        expect(stripNamespace('#/parameters/Item')).toEqual('Item');
        expect(stripNamespace('#/responses/Item')).toEqual('Item');
        expect(stripNamespace('#/securityDefinitions/Item')).toEqual('Item');
        expect(stripNamespace('#/components/schemas/Item')).toEqual('Item');
        expect(stripNamespace('#/components/responses/Item')).toEqual('Item');
        expect(stripNamespace('#/components/parameters/Item')).toEqual('Item');
        expect(stripNamespace('#/components/examples/Item')).toEqual('Item');
        expect(stripNamespace('#/components/requestBodies/Item')).toEqual('Item');
        expect(stripNamespace('#/components/headers/Item')).toEqual('Item');
        expect(stripNamespace('#/components/securitySchemes/Item')).toEqual('Item');
        expect(stripNamespace('#/components/links/Item')).toEqual('Item');
        expect(stripNamespace('#/components/callbacks/Item')).toEqual('Item');
    });
});
