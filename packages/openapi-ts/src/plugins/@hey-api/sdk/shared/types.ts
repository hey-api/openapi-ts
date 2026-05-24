import type { IR } from '@hey-api/shared';

import type { $ } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';

type ArrowFunc = Extract<ReturnType<typeof $.func>, { '~mode': 'arrow' }>;

export type ResponseHandlers = {
  transformer: ArrowFunc | ReturnType<typeof $.expr> | undefined;
  validator: ArrowFunc | undefined;
};

export type ValidatorArgs = {
  /** The operation object. */
  operation: IR.OperationObject;
  /** The plugin instance. */
  plugin: HeyApiSdkPlugin['Instance'];
};
