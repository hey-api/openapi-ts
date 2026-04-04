import type { Symbol } from '@hey-api/codegen-core';
import type {
  IR,
  Plugin,
  RequestSchemaContext,
  ResolvedRequestValidatorLayer,
  SchemaVisitorContext,
  SchemaWithType,
  Walker,
} from '@hey-api/shared';

import type { MaybeBigInt, ShouldCoerceToBigInt } from '../../plugins/shared/utils/coerce';
import type { GetIntegerLimit } from '../../plugins/shared/utils/formats';
import type { $, DollarTsDsl } from '../../ts-dsl';
import type { Pipe, PipeResult, Pipes, PipesUtils } from './shared/pipes';
import type { ValibotFinal, ValibotResult } from './shared/types';
import type { ValibotPlugin } from './types';

export type ValibotResolvers = Plugin.Resolvers<{
  /**
   * Resolver for array schemas.
   *
   * Allows customization of how array types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  array?: (ctx: ArrayResolverContext) => PipeResult;
  /**
   * Resolver for boolean schemas.
   *
   * Allows customization of how boolean types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  boolean?: (ctx: BooleanResolverContext) => PipeResult;
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => PipeResult;
  /**
   * Resolver for intersection schemas.
   *
   * Allows customization of how intersection types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  intersection?: (ctx: IntersectionResolverContext) => PipeResult;
  /**
   * Resolver for never schemas.
   *
   * Allows customization of how never types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  never?: (ctx: NeverResolverContext) => PipeResult;
  /**
   * Resolver for null schemas.
   *
   * Allows customization of how null types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  null?: (ctx: NullResolverContext) => PipeResult;
  /**
   * Resolver for number schemas.
   *
   * Allows customization of how number types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  number?: (ctx: NumberResolverContext) => PipeResult;
  /**
   * Resolver for object schemas.
   *
   * Allows customization of how object types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  object?: (ctx: ObjectResolverContext) => PipeResult;
  /**
   * Resolver for string schemas.
   *
   * Allows customization of how string types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  string?: (ctx: StringResolverContext) => PipeResult;
  /**
   * Resolver for tuple schemas.
   *
   * Allows customization of how tuple types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  tuple?: (ctx: TupleResolverContext) => PipeResult;
  /**
   * Resolver for undefined schemas.
   *
   * Allows customization of how undefined types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  undefined?: (ctx: UndefinedResolverContext) => PipeResult;
  /**
   * Resolver for union schemas.
   *
   * Allows customization of how union types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  union?: (ctx: UnionResolverContext) => PipeResult;
  /**
   * Resolver for unknown schemas.
   *
   * Allows customization of how unknown types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  unknown?: (ctx: UnknownResolverContext) => PipeResult;
  /**
   * Resolvers for request and response validators.
   *
   * Allow customization of validator function bodies.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  validator?:
    | ((ctx: ValidatorResolverContext) => PipeResult | null | undefined)
    | {
        /**
         * Controls how the request validator function body is generated.
         *
         * Returning `undefined` will execute the default resolver logic.
         */
        request?: (ctx: RequestValidatorResolverContext) => PipeResult | null | undefined;
        /**
         * Controls how the response validator function body is generated.
         *
         * Returning `undefined` will execute the default resolver logic.
         */
        response?: (ctx: ResponseValidatorResolverContext) => PipeResult | null | undefined;
      };
  /**
   * Resolver for void schemas.
   *
   * Allows customization of how void types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  void?: (ctx: VoidResolverContext) => PipeResult;
}>;

export interface BaseContext extends DollarTsDsl {
  /**
   * Functions for working with pipes.
   */
  pipes: PipesUtils & {
    /**
     * The current pipe.
     *
     * In Valibot, this represents a list of call expressions ("pipes")
     * being assembled to form a schema definition.
     *
     * Each pipe can be extended, modified, or replaced to customize
     * the resulting schema.
     */
    current: Pipes;
  };
  /** The plugin instance. */
  plugin: ValibotPlugin['Instance'];
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: {
    v: Symbol;
  };
}

export interface ArrayResolverContext extends BaseContext {
  applyModifiers: (result: ValibotResult, opts?: { optional?: boolean }) => ValibotFinal;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: ArrayResolverContext) => PipeResult;
    length: (ctx: ArrayResolverContext) => PipeResult;
    maxLength: (ctx: ArrayResolverContext) => PipeResult;
    minLength: (ctx: ArrayResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'array'>;
  walk: Walker<ValibotResult, ValibotPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ValibotPlugin['Instance']>;
}

export interface BooleanResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: BooleanResolverContext) => PipeResult;
    const: (ctx: BooleanResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'boolean'>;
}

export interface EnumResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base enum expression (v.picklist([...])).
     */
    base: (ctx: EnumResolverContext) => PipeResult;
    /**
     * Returns parsed enum items with metadata about the enum members.
     */
    items: (ctx: EnumResolverContext) => {
      /**
       * String literal values for use with v.picklist([...]).
       */
      enumMembers: Array<ReturnType<typeof $.literal>>;
      /**
       * Whether the enum includes a null value.
       */
      isNullable: boolean;
    };
  };
  schema: SchemaWithType<'enum'>;
}

export interface IntersectionResolverContext extends BaseContext {
  applyModifiers: (result: ValibotResult, opts?: { optional?: boolean }) => ValibotFinal;
  childResults: Array<ValibotResult>;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: IntersectionResolverContext) => PipeResult;
  };
  parentSchema: IR.SchemaObject;
  schema: IR.SchemaObject;
}

export interface NeverResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: NeverResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'never'>;
}

export interface NullResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: NullResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'null'>;
}

export interface NumberResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: NumberResolverContext) => PipeResult;
    const: (ctx: NumberResolverContext) => PipeResult;
    max: (ctx: NumberResolverContext) => PipeResult;
    min: (ctx: NumberResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'integer' | 'number'>;
  /**
   * Utility functions for number schema processing.
   */
  utils: {
    getIntegerLimit: GetIntegerLimit;
    maybeBigInt: MaybeBigInt;
    shouldCoerceToBigInt: ShouldCoerceToBigInt;
  };
}

export interface ObjectResolverContext extends BaseContext {
  _childResults: Array<ValibotResult>;
  applyModifiers: (result: ValibotResult, opts: { optional?: boolean }) => ValibotFinal;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    additionalProperties: (ctx: ObjectResolverContext) => Pipe | null | undefined;
    base: (ctx: ObjectResolverContext) => Pipes | Pipe;
    shape: (ctx: ObjectResolverContext) => ReturnType<typeof $.object>;
  };
  schema: SchemaWithType<'object'>;
  walk: Walker<ValibotResult, ValibotPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ValibotPlugin['Instance']>;
}

export interface StringResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: StringResolverContext) => PipeResult;
    const: (ctx: StringResolverContext) => PipeResult;
    format: (ctx: StringResolverContext) => PipeResult;
    length: (ctx: StringResolverContext) => PipeResult;
    maxLength: (ctx: StringResolverContext) => PipeResult;
    minLength: (ctx: StringResolverContext) => PipeResult;
    pattern: (ctx: StringResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'string'>;
}

export interface TupleResolverContext extends BaseContext {
  applyModifiers: (result: ValibotResult, opts?: { optional?: boolean }) => ValibotFinal;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: TupleResolverContext) => PipeResult;
    const: (ctx: TupleResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'tuple'>;
  walk: Walker<ValibotResult, ValibotPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ValibotPlugin['Instance']>;
}

export interface UndefinedResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: UndefinedResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'undefined'>;
}

export interface UnionResolverContext extends BaseContext {
  applyModifiers: (result: ValibotResult, opts?: { optional?: boolean }) => ValibotFinal;
  childResults: Array<ValibotResult>;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: UnionResolverContext) => PipeResult;
  };
  parentSchema: IR.SchemaObject;
  schema: IR.SchemaObject;
  schemas: ReadonlyArray<IR.SchemaObject>;
}

export interface UnknownResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: UnknownResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'unknown'>;
}

export interface RequestValidatorResolverContext
  extends BaseContext, RequestSchemaContext<ValibotPlugin['Instance']> {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the composite schema combining all layers.
     *
     * Returns `undefined` if all layers are omitted.
     */
    composite: (ctx: RequestValidatorResolverContext) => Pipe | undefined;
    /**
     * Returns an empty/fallback schema for a layer based on its `whenEmpty` config.
     *
     * @throws if `whenEmpty` is `'omit'` (no schema should be generated)
     */
    empty: (
      ctx: RequestValidatorResolverContext & {
        /** Resolved configuration for the request layer. */
        layer: ResolvedRequestValidatorLayer;
      },
    ) => Pipe;
    /**
     * Returns an optional schema based on the layer's config.
     */
    optional: (
      ctx: RequestValidatorResolverContext & {
        /** Resolved configuration for the request layer. */
        layer: ResolvedRequestValidatorLayer;
        /** The schema to conditionally wrap. */
        schema: Pipe;
      },
    ) => Pipe;
  };
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: BaseContext['symbols'] & {
    /**
     * The schema to use in the validator body.
     *
     * This is either:
     * - an inline AST expression
     * - a Symbol reference to a named export
     */
    schema: Symbol | Pipe;
  };
}

export interface ResponseValidatorResolverContext extends BaseContext {
  /** The operation being processed. */
  operation: IR.OperationObject;
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: BaseContext['symbols'] & {
    /**
     * The response schema symbol.
     */
    schema: Symbol;
  };
}

export type ValidatorResolverContext =
  | RequestValidatorResolverContext
  | ResponseValidatorResolverContext;

export interface VoidResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: VoidResolverContext) => PipeResult;
  };
  schema: SchemaWithType<'void'>;
}
