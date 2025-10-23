import type { Symbol, SymbolIn } from '@hey-api/codegen-core';

import type { IROperationObject } from '~/ir/types';
import type { PluginInstance } from '~/plugins/shared/utils/instance';

export type Hooks = {
  /**
   * Event hooks.
   */
  events?: {
    /**
     * Triggered after executing a plugin handler.
     *
     * @param args Arguments object.
     * @returns void
     */
    'plugin:handler:after'?: (args: {
      /** Plugin that just executed. */
      plugin: PluginInstance;
    }) => void;
    /**
     * Triggered before executing a plugin handler.
     *
     * @param args Arguments object.
     * @returns void
     */
    'plugin:handler:before'?: (args: {
      /** Plugin about to execute. */
      plugin: PluginInstance;
    }) => void;
    /**
     * Triggered after registering a symbol.
     *
     * You can use this to perform actions after a symbol is registered.
     *
     * @param args Arguments object.
     * @returns void
     */
    'symbol:register:after'?: (args: {
      /** Plugin that registered the symbol. */
      plugin: PluginInstance;
      /** The registered symbol. */
      symbol: Symbol;
    }) => void;
    /**
     * Triggered before registering a symbol.
     *
     * You can use this to modify the symbol before it's registered.
     *
     * @param args Arguments object.
     * @returns void
     */
    'symbol:register:before'?: (args: {
      /** Plugin registering the symbol. */
      plugin: PluginInstance;
      /** Symbol to register. */
      symbol: SymbolIn;
    }) => void;
    /**
     * Triggered after setting a symbol value.
     *
     * You can use this to perform actions after a symbol's value is set.
     *
     * @param args Arguments object.
     * @returns void
     */
    'symbol:setValue:after'?: (args: {
      /** Plugin that set the symbol value. */
      plugin: PluginInstance;
      /** The symbol. */
      symbol: Symbol;
      /** The value that was set. */
      value: unknown;
    }) => void;
    /**
     * Triggered before setting a symbol value.
     *
     *  You can use this to modify the value before it's set.
     *
     * @param args Arguments object.
     * @returns void
     */
    'symbol:setValue:before'?: (args: {
      /** Plugin setting the symbol value. */
      plugin: PluginInstance;
      /** The symbol. */
      symbol: Symbol;
      /** The value to set. */
      value: unknown;
    }) => void;
  };
  /**
   * Hooks specifically for overriding operations behavior.
   *
   * Use these to classify operations, decide which outputs to generate,
   * or apply custom behavior to individual operations.
   */
  operations?: {
    /**
     * Classify the given operation into one or more kinds.
     *
     * Each kind determines how we treat the operation (e.g., generating queries or mutations).
     *
     * **Default behavior:**
     * - GET → 'query'
     * - DELETE, PATCH, POST, PUT → 'mutation'
     *
     * **Resolution order:**
     * 1. If `isQuery` or `isMutation` returns `true` or `false`, that overrides `getKind`.
     * 2. If `isQuery` or `isMutation` returns `undefined`, the result of `getKind` is used.
     *
     * @param operation - The operation object to classify.
     * @returns An array containing one or more of 'query' or 'mutation', or undefined to fallback to default behavior.
     * @example
     * ```ts
     * getKind: (operation) => {
     *   if (operation.method === 'get' && operation.path === '/search') {
     *     return ['query', 'mutation'];
     *   }
     *   return; // fallback to default behavior
     * }
     * ```
     */
    getKind?: (
      operation: IROperationObject,
    ) => ReadonlyArray<'mutation' | 'query'> | undefined;
    /**
     * Check if the given operation should be treated as a mutation.
     *
     * This affects which outputs are generated for the operation.
     *
     * **Default behavior:** DELETE, PATCH, POST, and PUT operations are treated as mutations.
     *
     * **Resolution order:** If this returns `true` or `false`, it overrides `getKind`.
     * If it returns `undefined`, `getKind` is used instead.
     *
     * @param operation - The operation object to check.
     * @returns true if the operation is a mutation, false otherwise, or undefined to fallback to `getKind`.
     * @example
     * ```ts
     * isMutation: (operation) => {
     *   if (operation.method === 'post' && operation.path === '/search') {
     *     return true;
     *   }
     *   return; // fallback to default behavior
     * }
     * ```
     */
    isMutation?: (operation: IROperationObject) => boolean | undefined;
    /**
     * Check if the given operation should be treated as a query.
     *
     * This affects which outputs are generated for the operation.
     *
     * **Default behavior:** GET operations are treated as queries.
     *
     * **Resolution order:** If this returns `true` or `false`, it overrides `getKind`.
     * If it returns `undefined`, `getKind` is used instead.
     *
     * @param operation - The operation object to check.
     * @returns true if the operation is a query, false otherwise, or undefined to fallback to `getKind`.
     * @example
     * ```ts
     * isQuery: (operation) => {
     *   if (operation.method === 'post' && operation.path === '/search') {
     *     return true;
     *   }
     *   return; // fallback to default behavior
     * }
     * ```
     */
    isQuery?: (operation: IROperationObject) => boolean | undefined;
  };
  /**
   * Hooks specifically for overriding symbols behavior.
   *
   * Use these to customize file placement.
   */
  symbols?: {
    /**
     * Optional output strategy to override default plugin behavior.
     *
     * Use this to route generated symbols to specific files.
     *
     * @returns The file path to output the symbol to, or undefined to fallback to default behavior.
     */
    getFilePath?: (symbol: Symbol) => string | undefined;
  };
};
