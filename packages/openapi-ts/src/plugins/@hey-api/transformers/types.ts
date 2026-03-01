import type { IR } from '@hey-api/shared';
import type { DefinePlugin, Plugin } from '@hey-api/shared';
import type ts from 'typescript';

import type { ExpressionTransformer } from './expressions';

/**
 * Returns the TypeScript type node for a schema with a specific format.
 * If undefined is returned, the default type will be used.
 */
export type TypeTransformer = ({ schema }: { schema: IR.SchemaObject }) => ts.TypeNode | undefined;

export type UserConfig = Plugin.Name<'@hey-api/transformers'> &
  Plugin.Hooks &
  Plugin.UserExports & {
    /**
     * Convert long integers into BigInt values?
     *
     * @default true
     */
    bigInt?: boolean;
    /**
     * Convert date-time strings into Date objects?
     * Only affects fields with format "date-time", not "date".
     *
     * @default true
     */
    dates?: boolean;
    /**
     * Custom transforms to apply to the generated code.
     */
    transformers?: ReadonlyArray<ExpressionTransformer>;
    /**
     * Custom type transformers that modify the TypeScript types generated.
     */
    typeTransformers?: ReadonlyArray<TypeTransformer>;
  };

export type Config = Plugin.Name<'@hey-api/transformers'> &
  Plugin.Hooks &
  Plugin.Exports & {
    /**
     * Convert long integers into BigInt values?
     *
     * @default true
     */
    bigInt: boolean;
    /**
     * Convert date-time strings into Date objects?
     * Only affects fields with format "date-time", not "date".
     *
     * @default true
     */
    dates: boolean;
    /**
     * Custom transforms to apply to the generated code.
     */
    transformers: ReadonlyArray<ExpressionTransformer>;
    /**
     * Custom type transformers that modify the TypeScript types generated.
     */
    typeTransformers: ReadonlyArray<TypeTransformer>;
  };

export type HeyApiTransformersPlugin = DefinePlugin<UserConfig, Config>;
