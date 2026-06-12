import type { RString } from '../../../../py-dsl/utils/r-string';
import { rString } from '../../../../py-dsl/utils/r-string';

export interface PydanticFieldConstraints {
  description?: string;
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
  pattern?: RString;
  title?: string;
}

const VALIDATION_KEYS: ReadonlyArray<keyof PydanticFieldConstraints> = [
  'ge',
  'gt',
  'le',
  'lt',
  'min_length',
  'max_length',
  'multiple_of',
  'pattern',
];

export class PydanticConstraintsDsl {
  readonly '~dsl' = 'PydanticConstraintsDsl';

  private _values: PydanticFieldConstraints = {};

  get hasValidationConstraints(): boolean {
    return VALIDATION_KEYS.some((k) => this._values[k] !== undefined);
  }

  get isEmpty(): boolean {
    return Object.keys(this._values).length === 0;
  }

  get values(): Readonly<PydanticFieldConstraints> {
    return this._values;
  }

  description(text: string): this {
    this._values.description = text;
    return this;
  }

  ge(n: number): this {
    this._values.ge = n;
    return this;
  }

  gt(n: number): this {
    this._values.gt = n;
    return this;
  }

  le(n: number): this {
    this._values.le = n;
    return this;
  }

  lt(n: number): this {
    this._values.lt = n;
    return this;
  }

  maxLength(n: number): this {
    this._values.max_length = n;
    return this;
  }

  merge(other: PydanticConstraintsDsl): PydanticConstraintsDsl {
    this._values = { ...this._values, ...other._values };
    return this;
  }

  minLength(n: number): this {
    this._values.min_length = n;
    return this;
  }

  multipleOf(n: number): this {
    this._values.multiple_of = n;
    return this;
  }

  pattern(p: string): this {
    this._values.pattern = rString(p);
    return this;
  }

  title(text: string): this {
    this._values.title = text;
    return this;
  }
}
