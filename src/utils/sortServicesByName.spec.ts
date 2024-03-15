import type { Service } from '../client/interfaces/Service';
import { sortServicesByName } from './sortServicesByName';

describe('sortServicesByName', () => {
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

        const services: Service[] = [john, jane, doe];

        expect(sortServicesByName([])).toEqual([]);
        expect(sortServicesByName(services)).toEqual([doe, jane, john]);
    });
});
