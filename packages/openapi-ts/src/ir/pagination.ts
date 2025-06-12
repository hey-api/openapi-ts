import type { Config } from '../types/config';
import type { IR } from './types';

export const DEFAULT_PAGINATION_KEYWORDS = [
  'after',
  'before',
  'cursor',
  'offset',
  'page',
  'start',
] as const;

export function getPaginationKeywordsRegExp({
  keywords = DEFAULT_PAGINATION_KEYWORDS,
}: Config['input']['pagination'] = {}): RegExp {
  if (!keywords.length) {
    keywords = DEFAULT_PAGINATION_KEYWORDS;
  }
  const pattern = `^(${keywords.join('|')})$`;
  return new RegExp(pattern);
}

export interface Pagination {
  in: string;
  name: string;
  schema: IR.SchemaObject;
}
