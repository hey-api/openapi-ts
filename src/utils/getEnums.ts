import type { Enum } from '../client/interfaces/Enum';
import type { WithEnumExtension } from '../client/interfaces/WithEnumExtension';
import { unique } from './unique';

export const getEnums = (definition: WithEnumExtension, values?: ReadonlyArray<string | number>): Enum[] => {
    if (!Array.isArray(values)) {
        return [];
    }

    const descriptions = (definition['x-enum-descriptions'] ?? []).filter(value => typeof value === 'string');
    const names = (definition['x-enum-varnames'] ?? []).filter(value => typeof value === 'string');

    return values
        .filter(unique)
        .filter(value => typeof value === 'number' || typeof value === 'string')
        .map((value, index) => ({
            'x-enum-description': descriptions[index],
            'x-enum-varname': names[index],
            description: undefined,
            value,
        }));
};
