import type { Config } from '../../../types/config';
import type { OpenApiV3_0_X } from '../types/spec';

export const transformSpec = ({
  spec,
  transforms,
}: {
  spec: OpenApiV3_0_X;
  transforms: Config['parser']['transforms'];
}) => {
  console.log(spec, transforms);
};
