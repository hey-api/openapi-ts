import camelcase from 'camelcase';

import { getConfig } from './config';

export const transformName = (name: string) => {
    const config = getConfig();
    if (config.types.name === 'PascalCase') {
        return camelcase(name, { pascalCase: true });
    }
    return name;
};
