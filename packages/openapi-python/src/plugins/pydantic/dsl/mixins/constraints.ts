import type { py } from '../../../../py-compiler';
import type { BaseCtor, MixinCtor } from '../../../../py-dsl/mixins/types';

export interface FieldConstraintValues {
  /** Greater than or equal constraint for numbers. */
  ge?: number;
  /** Greater than constraint for numbers. */
  gt?: number;
  /** Less than or equal constraint for numbers. */
  le?: number;
  /** Less than constraint for numbers. */
  lt?: number;
  /** Maximum length constraint for strings/arrays. */
  max_length?: number;
  /** Minimum length constraint for strings/arrays. */
  min_length?: number;
  /** Multiple of constraint for numbers. */
  multiple_of?: number;
  /** Regex pattern constraint for strings. */
  pattern?: string;
}

export interface ConstraintsMethods extends Node {
  constraints: FieldConstraintValues;
  /** Greater than or equal constraint for numbers. */
  ge(number: number): this;
  /** Greater than constraint for numbers. */
  gt(number: number): this;
  hasConstraints: boolean;
  /** Less than or equal constraint for numbers. */
  le(number: number): this;
  /** Less than constraint for numbers. */
  lt(number: number): this;
  /** Maximum length constraint for strings/arrays. */
  maxLength(number: number): this;
  /** Minimum length constraint for strings/arrays. */
  minLength(number: number): this;
  /** Multiple of constraint for numbers. */
  multipleOf(number: number): this;
  /** Regex pattern constraint for strings. */
  pattern(pattern: string): this;
}

export function ConstraintsMixin<T extends py.Node, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Constraints extends Base {
    protected constraints: FieldConstraintValues = {};

    protected ge(number: number): this {
      this.constraints.ge = number;
      return this;
    }

    protected gt(number: number): this {
      this.constraints.gt = number;
      return this;
    }

    protected le(number: number): this {
      this.constraints.le = number;
      return this;
    }

    protected lt(number: number): this {
      this.constraints.lt = number;
      return this;
    }

    protected maxLength(number: number): this {
      this.constraints.max_length = number;
      return this;
    }

    protected minLength(number: number): this {
      this.constraints.min_length = number;
      return this;
    }

    protected multipleOf(number: number): this {
      this.constraints.multiple_of = number;
      return this;
    }

    protected pattern(pattern: string): this {
      this.constraints.pattern = pattern;
      return this;
    }

    protected get hasConstraints(): boolean {
      return Object.keys(this.constraints).length > 0;
    }
  }

  return Constraints as unknown as MixinCtor<TBase, ConstraintsMethods>;
}
