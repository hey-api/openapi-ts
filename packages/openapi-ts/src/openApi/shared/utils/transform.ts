import type { Config } from '../../../types/config';

export const hasTransforms = (
  config: Config['parser']['transforms'],
): boolean => Boolean(config.enums);
