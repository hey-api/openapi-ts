import type { Enum } from '../../../client/interfaces/Enum';
import sanitizeEnumName from '../../../utils/sanitizeEnumName';

export const getEnum = (values?: (string | number)[]): Enum[] => {
    if (Array.isArray(values)) {
        return values
            .filter((value, index, arr) => {
                return arr.indexOf(value) === index;
            })
            .filter((value: any) => {
                return typeof value === 'number' || typeof value === 'string';
            })
            .map(value => {
                if (typeof value === 'number') {
                    return {
                        name: `'_${value}'`,
                        value: String(value),
                        type: 'number',
                        description: null,
                    };
                }
                return {
                    name: sanitizeEnumName(String(value)),
                    value: `'${value.replace(/'/g, "\\'")}'`,
                    type: 'string',
                    description: null,
                };
            });
    }
    return [];
};
