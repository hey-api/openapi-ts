import type { StringCase, StringName } from '../../../types/case';
import { stringCase } from '../../../utils/stringCase';

export const buildName = ({
  config,
  name,
}: {
  config: {
    case: StringCase;
    name?: StringName;
  };
  name: string;
}): string => {
  if (typeof config.name === 'function') {
    name = config.name(name);
  } else if (config.name) {
    const separator = config.case === 'preserve' ? '' : '-';
    name = config.name.replace('{{name}}', `${separator}${name}${separator}`);
  }

  return stringCase({ case: config.case, value: name });
};
