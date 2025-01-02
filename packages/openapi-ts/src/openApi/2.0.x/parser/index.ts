import type { IR } from '../../../ir/types';
import type { OpenApiV2_0_X } from '../types/spec';

export const parseV2_0_X = (context: IR.Context<OpenApiV2_0_X>) => {
  if (context.spec.definitions) {
    // TODO
  }
};
