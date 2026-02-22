import type {
  IR,
  NamingConfig,
  SchemaProcessorContext,
  SchemaProcessorResult,
} from '@hey-api/shared';

import type { IrSchemaToAstOptions, TypeOptions } from './types';

export type ProcessorContext = Pick<IrSchemaToAstOptions, 'plugin'> &
  SchemaProcessorContext & {
    naming: NamingConfig & TypeOptions;
    schema: IR.SchemaObject;
  };

export type ProcessorResult = SchemaProcessorResult<ProcessorContext>;
