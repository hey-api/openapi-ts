import { $ } from '../../../../py-dsl';

export function literalize(
  value: unknown,
): string | number | ReturnType<typeof $.expr | typeof $.literal> {
  if (value === null) return $('None');
  if (typeof value === 'string') return $.literal(value);
  if (typeof value === 'number') return $.literal(value);
  if (typeof value === 'boolean') return value ? $('True') : $('False');
  return String(value);
}
