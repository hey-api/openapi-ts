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
    name = config.name.replace('{{name}}', name);
  }

  return stringCase({ case: config.case, value: name });
};
