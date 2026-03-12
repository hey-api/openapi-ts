import type { Plugin } from '@hey-api/shared';
import type { IR, SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import type { $, DollarTsDsl } from '../../ts-dsl';
import type { ArktypeResult } from './shared/types';
import type { ArktypeFinal } from './shared/types';
import type { IApi } from './api';
import type { ArktypePlugin } from './types';

export type Resolvers = Plugin.Resolvers<{
  /**
   * Resolver for array schemas.
   *
   * Allows customization of how array types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  array?: (ctx: ArrayResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for boolean schemas.
   *
   * Allows customization of how boolean types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  boolean?: (ctx: BooleanResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for intersection schemas.
   *
   * Allows customization of how intersection types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  intersection?: (ctx: IntersectionResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for never schemas.
   *
   * Allows customization of how never types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  never?: (ctx: NeverResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for null schemas.
   *
   * Allows customization of how null types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  null?: (ctx: NullResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for number schemas.
   *
   * Allows customization of how number types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  number?: (ctx: NumberResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for object schemas.
   *
   * Allows customization of how object types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  object?: (ctx: ObjectResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for string schemas.
   *
   * Allows customization of how string types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  string?: (ctx: StringResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for tuple schemas.
   *
   * Allows customization of how tuple types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  tuple?: (ctx: TupleResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for undefined schemas.
   *
   * Allows customization of how undefined types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  undefined?: (ctx: UndefinedResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for union schemas.
   *
   * Allows customization of how union types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  union?: (ctx: UnionResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for unknown schemas.
   *
   * Allows customization of how unknown types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  unknown?: (ctx: UnknownResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for void schemas.
   *
   * Allows customization of how void types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  void?: (ctx: VoidResolverContext) => ArktypeResult | undefined;
  /**
   * Resolver for validator functions.
   *
   * Allows customization of how validator functions are generated.
   *
   * Returning `null` or `undefined` will execute the default resolver logic.
   * Returning `false` will skip validator generation.
   */
  validator?: (ctx: ValidatorResolverContext) => ReturnType<typeof $.func> | null | undefined;
}>;

/**
 * Base context shared by all resolver contexts.
 */
interface BaseContext extends DollarTsDsl {
  /**
   * Functions for working with the result.
   */
  applyModifiers: (result: ArktypeResult, opts?: { optional?: boolean }) => ArktypeFinal;
  /**
   * The plugin instance.
   */
  plugin: ArktypePlugin['Instance'];
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: {
    type: Symbol;
  };
}

/**
 * Context for array schema resolvers.
 */
export interface ArrayResolverContext extends BaseContext {
  /**
   * Child results from processing array items.
   */
  childResults: Array<ArktypeResult>;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base array expression (e.g., `string[]`).
     */
    base: (ctx: ArrayResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the length constraint expression (e.g., `>= 3`).
     */
    length: (ctx: ArrayResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the max length constraint expression (e.g., `<= 10`).
     */
    maxLength: (ctx: ArrayResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the min length constraint expression (e.g., `>= 3`).
     */
    minLength: (ctx: ArrayResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'array'>;
  /**
   * The walker function for recursing into children.
   */
  walk: Walker<ArktypeResult, ArktypePlugin['Instance']>;
  /**
   * The walker context.
   */
  walkerCtx: SchemaVisitorContext<ArktypePlugin['Instance']>;
}

/**
 * Context for boolean schema resolvers.
 */
export interface BooleanResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base boolean expression (e.g., `boolean`).
     */
    base: (ctx: BooleanResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the constant boolean expression (e.g., `true` or `false`).
     */
    const: (ctx: BooleanResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'boolean'>;
}

/**
 * Context for enum schema resolvers.
 */
export interface EnumResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base enum expression (e.g., `'a' | 'b' | 'c'`).
     */
    base: (ctx: EnumResolverContext) => ArktypeResult | undefined;
    /**
     * Returns parsed enum items with metadata about the enum members.
     */
    items: (ctx: EnumResolverContext) => {
      /**
       * String literal values for use in unions.
       */
      enumMembers: Array<ReturnType<typeof $.literal>>;
      /**
       * Whether the enum includes a null value.
       */
      isNullable: boolean;
    };
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'enum'>;
}

/**
 * Context for intersection schema resolvers.
 */
export interface IntersectionResolverContext extends BaseContext {
  /**
   * Results from processing intersection items.
   */
  childResults: Array<ArktypeResult>;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base intersection expression.
     */
    base: (ctx: IntersectionResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The parent schema (for metadata composition).
   */
  parentSchema: IR.SchemaObject;
  /**
   * The schema being processed.
   */
  schema: IR.SchemaObject;
}

/**
 * Context for never schema resolvers.
 */
export interface NeverResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base never expression (e.g., `never`).
     */
    base: (ctx: NeverResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'never'>;
}

/**
 * Context for null schema resolvers.
 */
export interface NullResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base null expression (e.g., `null`).
     */
    base: (ctx: NullResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'null'>;
}

/**
 * Context for number schema resolvers.
 */
export interface NumberResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base number expression (e.g., `number` or `number.integer`).
     */
    base: (ctx: NumberResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the constant number expression (e.g., `42`).
     */
    const: (ctx: NumberResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the max value constraint expression (e.g., `<= 100`).
     */
    max: (ctx: NumberResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the min value constraint expression (e.g., `>= 0`).
     */
    min: (ctx: NumberResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed (integer or number).
   */
  schema: SchemaWithType<'integer' | 'number'>;
  /**
   * Utility functions for number schema processing.
   */
  utils: {
    /**
     * Gets the limit value for a given integer format (e.g., int32 -> 2147483647).
     */
    getIntegerLimit: (format: string) => number;
    /**
     * Coerces a value to BigInt if needed based on format.
     */
    maybeBigInt: (value: unknown, format: string | undefined) => unknown;
    /**
     * Determines if a format should be coerced to BigInt.
     */
    shouldCoerceToBigInt: (format: string | undefined) => boolean;
  };
}

/**
 * Context for object schema resolvers.
 */
export interface ObjectResolverContext extends BaseContext {
  /**
   * Results from processing object properties (nullable tracking).
   */
  _childResults: Array<ArktypeResult>;
  /**
   * Applies modifiers (optional/nullable/default/readonly) to a result.
   */
  applyModifiers: (result: ArktypeResult, opts?: { optional?: boolean }) => ArktypeFinal;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the additional properties expression (e.g., `[string]: unknown`).
     * Returns `null` if no additional properties, `undefined` if additionalProperties is true.
     */
    additionalProperties: (ctx: ObjectResolverContext) => ArktypeResult | null | undefined;
    /**
     * Returns the base object expression (e.g., the pipes before shape is applied).
     */
    base: (ctx: ObjectResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the object shape expression (e.g., `{ name: string, age?: number }`).
     */
    shape: (ctx: ObjectResolverContext) => ReturnType<typeof $.object>;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'object'>;
  /**
   * The walker function for recursing into children.
   */
  walk: Walker<ArktypeResult, ArktypePlugin['Instance']>;
  /**
   * The walker context.
   */
  walkerCtx: SchemaVisitorContext<ArktypePlugin['Instance']>;
}

/**
 * Context for string schema resolvers.
 */
export interface StringResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base string expression (e.g., `string`).
     */
    base: (ctx: StringResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the constant string expression (e.g., `'hello'`).
     */
    const: (ctx: StringResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the format expression (e.g., `string.email`).
     */
    format: (ctx: StringResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the length constraint expression (e.g., `>= 3`).
     */
    length: (ctx: StringResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the max length constraint expression (e.g., `<= 10`).
     */
    maxLength: (ctx: StringResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the min length constraint expression (e.g., `>= 3`).
     */
    minLength: (ctx: StringResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the pattern expression (e.g., `/^[a-z]+$/`).
     */
    pattern: (ctx: StringResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'string'>;
}

/**
 * Context for tuple schema resolvers.
 */
export interface TupleResolverContext extends BaseContext {
  /**
   * Applies modifiers (optional/nullable/default/readonly) to a result.
   */
  applyModifiers: (result: ArktypeResult, opts?: { optional?: boolean }) => ArktypeFinal;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base tuple expression (e.g., `[string, number]`).
     */
    base: (ctx: TupleResolverContext) => ArktypeResult | undefined;
    /**
     * Returns the constant tuple expression (e.g., `['hello', 42]`).
     */
    const: (ctx: TupleResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'tuple'>;
  /**
   * The walker function for recursing into children.
   */
  walk: Walker<ArktypeResult, ArktypePlugin['Instance']>;
  /**
   * The walker context.
   */
  walkerCtx: SchemaVisitorContext<ArktypePlugin['Instance']>;
}

/**
 * Context for undefined schema resolvers.
 */
export interface UndefinedResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base undefined expression (e.g., `undefined`).
     */
    base: (ctx: UndefinedResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'undefined'>;
}

/**
 * Context for union schema resolvers.
 */
export interface UnionResolverContext extends BaseContext {
  /**
   * Results from processing union items.
   */
  childResults: Array<ArktypeResult>;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base union expression.
     */
    base: (ctx: UnionResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The parent schema (for metadata composition).
   */
  parentSchema: IR.SchemaObject;
  /**
   * The schema being processed.
   */
  schema: IR.SchemaObject;
  /**
   * The union member schemas.
   */
  schemas: ReadonlyArray<IR.SchemaObject>;
}

/**
 * Context for unknown schema resolvers.
 */
export interface UnknownResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base unknown expression (e.g., `unknown`).
     */
    base: (ctx: UnknownResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'unknown'>;
}

/**
 * Context for void schema resolvers.
 */
export interface VoidResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base void expression (e.g., `void` or `undefined`).
     */
    base: (ctx: VoidResolverContext) => ArktypeResult | undefined;
  };
  /**
   * The schema being processed.
   */
  schema: SchemaWithType<'void'>;
}

/**
 * Context for validator resolvers.
 */
export interface ValidatorResolverContext extends BaseContext {
  /**
   * The operation being validated.
   */
  operation: IR.OperationObject;
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: BaseContext['symbols'] & {
    /**
     * Symbol for the schema being validated.
     */
    schema: Symbol;
  };
};