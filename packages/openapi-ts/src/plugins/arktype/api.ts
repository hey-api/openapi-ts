import type { RequestSchemaContext } from '@hey-api/shared';

import type { $ } from '../../ts-dsl';
import type { ValidatorArgs } from './shared/types';
import type { ArktypePlugin } from './types';
import { createRequestValidatorV2, createResponseValidatorV2 } from './v2/api';

type ArrowFunc = Extract<ReturnType<typeof $.func>, { '~mode': 'arrow' }>;

export type IApi = {
  createRequestValidator: (
    args: RequestSchemaContext<ArktypePlugin['Instance']>,
  ) => ArrowFunc | undefined;
  createResponseValidator: (args: ValidatorArgs) => ArrowFunc | undefined;
};

export class Api implements IApi {
  createRequestValidator(
    args: RequestSchemaContext<ArktypePlugin['Instance']>,
  ): ArrowFunc | undefined {
    return createRequestValidatorV2(args);
  }

  createResponseValidator(args: ValidatorArgs): ArrowFunc | undefined {
    return createResponseValidatorV2(args);
  }
}
