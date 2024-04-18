import camelcase from 'camelcase';

import { getConfig } from './config';

export const transformServiceName = (name: string) => {
  const config = getConfig();
  if (config.services.name) {
    return config.services.name.replace('{{name}}', name);
  }
  return name;
};

export const transformTypeName = (name: string) => {
  const config = getConfig();
  if (config.types.name === 'PascalCase') {
    return camelcase(name, { pascalCase: true });
  }
  return name;
};
