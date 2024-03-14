import type { Service } from '../client/interfaces/Service';
import { getServiceNames } from './getServiceNames';

describe('getServiceNames', () => {
    it('should return sorted list', () => {
        const john: Service = {
            $refs: [],
            imports: [],
            name: 'John',
            operations: [],
        };
        const jane: Service = {
            $refs: [],
            imports: [],
            name: 'Jane',
            operations: [],
        };
        const doe: Service = {
            $refs: [],
            imports: [],
            name: 'Doe',
            operations: [],
        };

        const services = [john, jane, doe];

        expect(getServiceNames([])).toEqual([]);
        expect(getServiceNames(services)).toEqual(['Doe', 'Jane', 'John']);
    });
});
