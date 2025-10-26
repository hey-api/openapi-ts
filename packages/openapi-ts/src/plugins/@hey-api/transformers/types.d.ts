import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin } from '~/plugins';

import type { IApi } from './api';
import type { ExpressionTransformer } from './expressions';

/**
 * Returns the TypeScript type node for a schema with a specific format.
 * If undefined is returned, the default type will be used.
 */
export type TypeTransformer = ({
  schema,
}: {
  schema: IR.SchemaObject;
}) => ts.TypeNode | undefined;

export type UserConfig = Plugin.Name<'@hey-api/transformers'> &
  Plugin.Hooks & {
    /**
     * Convert long integers into BigInt values?
     *
     * @default true
     */
    bigInt?: boolean;
    /**
     * Convert date strings into Date objects?
     *
     * @default true
     */
    dates?: boolean;
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
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
  Plugin.Hooks & {
    /**
     * Convert long integers into BigInt values?
     *
     * @default true
     */
    bigInt: boolean;
    /**
     * Convert date strings into Date objects?
     *
     * @default true
     */
    dates: boolean;
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex: boolean;
    /**
     * Custom transforms to apply to the generated code.
     */
    transformers: ReadonlyArray<ExpressionTransformer>;
    /**
     * Custom type transformers that modify the TypeScript types generated.
     */
    typeTransformers: ReadonlyArray<TypeTransformer>;
  };

export type HeyApiTransformersPlugin = DefinePlugin<UserConfig, Config, IApi>;
