import type { Config } from '../../../types/config';
import { stringCase } from '../../../utils/stringCase';

type Transforms = Config['parser']['transforms'];

export const getReadWriteName = ({
  config,
  name,
}: {
  config:
    | Transforms['readWrite']['requests']
    | Transforms['readWrite']['responses'];
  name: string;
}): string => {
  if (typeof config.name === 'function') {
    name = config.name(name);
  } else {
    name = config.name.replace('{{name}}', name);
  }

  return stringCase({ case: config.case, value: name });
};

export const hasTransforms = (config: Transforms): boolean =>
  Boolean(config.enums) || config.readWrite.enabled;
