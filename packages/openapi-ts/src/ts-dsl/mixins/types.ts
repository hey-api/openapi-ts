import type ts from 'typescript';

import type { TsDsl } from '../base';

/**
 * Base constructor type for DSL nodes
 */
export type BaseCtor<T extends ts.Node> = abstract new (...args: unknown[]) => TsDsl<T>;

/**
 * Remove first element from tuple type
 */
export type DropFirst<T extends readonly unknown[]> = T extends [unknown, ...infer Rest]
  ? Rest
  : never;

/**
 * Generic constructor type for mixins
 * Combines base class instance + extra properties
 */
export type MixinCtor<T extends BaseCtor<any>, K = Record<string, unknown>> = abstract new (
  ...args: ConstructorParameters<T>
) => InstanceType<T> & K;

/**
 * Generic function type (safe replacement for any function)
 */
export type AnyFn = (...args: unknown[]) => unknown;

/**
 * Utility type: unwrap Promise return type
 */
export type AwaitedReturn<T> = T extends Promise<infer R> ? R : T;

/**
 * Deep partial (safe recursive type)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility: extract instance type safely
 */
export type Instance<T> = T extends new (...args: unknown[]) => infer R ? R : never;
