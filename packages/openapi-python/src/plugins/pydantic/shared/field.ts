import { $ } from '../../../py-dsl';
import type { PydanticPlugin } from '../types';
import type { FieldConstraints } from '../v2/constants';

type FieldArg = ReturnType<typeof $.expr | typeof $.kwarg | typeof $.literal>;

export function createFieldCall(
  constraints: FieldConstraints,
  plugin: PydanticPlugin['Instance'],
  options?: {
    /** If true, the field is required. */
    required?: boolean;
  },
): ReturnType<typeof $.call> {
  const field = plugin.external('pydantic.Field');
  const args: Array<FieldArg> = [];

  const isRequired = options?.required !== false && constraints.default === undefined;

  // For required fields with no default, use ... as first arg
  if (isRequired && constraints.default === undefined) {
    args.push($('...'));
  }

  // TODO: move to DSL
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

    args.push($.kwarg(key, toKwargValue(value)));
  }

  return $(field).call(...(args as Array<Parameters<typeof $.call>[1]>));
}

/**
 * Converts a constraint value to a kwarg-compatible value.
 */
function toKwargValue(value: unknown): string | number | boolean | null {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  // For complex types, stringify
  return String(value);
}
