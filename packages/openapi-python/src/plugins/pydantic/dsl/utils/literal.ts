import { $ } from '../../../../py-dsl';

export function literalize(value: unknown): string | number | ReturnType<typeof $.expr> {
  if (value === null) return $('None');
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  return String(value);
}
