import { $ } from '../../../py-dsl';
import type { KwargPyDsl } from '../../../py-dsl/expr/kwarg';
import type { PydanticPlugin } from '../types';
import type { PydanticResult } from './types';

/**
 * Field constraint keys that map to Pydantic Field() parameters.
 */
export interface FieldConstraints {
  /** Alias for the field name in serialization */
  alias?: string;
  /** Default value for the field */
  default?: unknown;
  /** Default factory function (for mutable defaults) */
  default_factory?: string;
  /** Description of the field */
  description?: string;
  /** Greater than or equal constraint for numbers */
  ge?: number;
  /** Greater than constraint for numbers */
  gt?: number;
  /** Less than or equal constraint for numbers */
  le?: number;
  /** Less than constraint for numbers */
  lt?: number;
  /** Maximum length constraint for strings/arrays */
  max_length?: number;
  /** Minimum length constraint for strings/arrays */
  min_length?: number;
  /** Multiple of constraint for numbers */
  multiple_of?: number;
  /** Regex pattern constraint for strings */
  pattern?: string;
  /** Title for the field */
  title?: string;
}

/**
 * Checks if any constraints require a Field() call.
 */
export function hasConstraints(constraints: Required<PydanticResult>['fieldConstraints']): boolean {
  const relevantKeys: Array<keyof FieldConstraints> = [
    'alias',
    'default',
    'default_factory',
    'description',
    'ge',
    'gt',
    'le',
    'lt',
    'max_length',
    'min_length',
    'multiple_of',
    'pattern',
    'title',
  ];

  return relevantKeys.some((key) => constraints[key] !== undefined);
}

type FieldArg = ReturnType<typeof $.literal> | ReturnType<typeof $> | KwargPyDsl;

/**
 * Creates a Pydantic Field() call expression with the given constraints.
 *
 * @example
 * // With constraints
 * createFieldCall({ min_length: 1, description: "Name" }, plugin)
 * // Returns: Field(..., min_length=1, description="Name")
 *
 * // Without constraints but with default
 * createFieldCall({ default: "test" }, plugin)
 * // Returns: Field(default="test")
 */
export function createFieldCall(
  constraints: Required<PydanticResult>['fieldConstraints'],
  plugin: PydanticPlugin['Instance'],
  options?: {
    /** If true, the field is required (default behavior) */
    required?: boolean;
  },
): ReturnType<typeof $.call> {
  const field = plugin.external('pydantic.Field');
  const args: Array<FieldArg> = [];

  // Handle required vs optional
  const isRequired = options?.required !== false && constraints.default === undefined;

  // For required fields with no default, use ... as first arg
  if (isRequired && constraints.default === undefined) {
    args.push($('...'));
  }

  // Add constraint arguments in a consistent order
  const orderedKeys: Array<keyof FieldConstraints> = [
    'default',
    'default_factory',
    'alias',
    'title',
    'description',
    'gt',
    'ge',
    'lt',
    'le',
    'multiple_of',
    'min_length',
    'max_length',
    'pattern',
  ];

  for (const key of orderedKeys) {
    const value = constraints[key];
    if (value === undefined) continue;

    // Skip default if we already added ... for required fields
    if (key === 'default' && isRequired) continue;

    // Create keyword argument using $.kwarg
    args.push($.kwarg(key, toKwargValue(value)));
  }

  // Type assertion needed because args include KwargPyDsl which produces KeywordArgument
  return $(field).call(...(args as Parameters<typeof $.call>[1][]));
}

/**
 * Converts a constraint value to a kwarg-compatible value.
 */
function toKwargValue(value: unknown): string | number | boolean | null {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  // For complex types, stringify
  return String(value);
}

/**
 * Merges multiple constraint objects, with later objects taking precedence.
 */
export function mergeConstraints(
  ...constraintSets: Array<Required<PydanticResult>['fieldConstraints']>
): Required<PydanticResult>['fieldConstraints'] {
  const merged: Required<PydanticResult>['fieldConstraints'] = {};

  for (const constraints of constraintSets) {
    for (const [key, value] of Object.entries(constraints)) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }
  }

  return merged;
}
