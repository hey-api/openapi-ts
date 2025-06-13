import type { Config } from '../types/config';
import type { IR } from './types';

export const defaultPaginationKeywords = [
  'after',
  'before',
  'cursor',
  'offset',
  'page',
  'start',
] as const;

export function getPaginationKeywordsRegExp({
  keywords = defaultPaginationKeywords,
}: Config['input']['pagination'] = {}): RegExp {
  if (!keywords.length) {
    keywords = defaultPaginationKeywords;
  }
  const pattern = `^(${keywords.join('|')})$`;
  return new RegExp(pattern);
}

export interface Pagination {
  in: string;
  name: string;
  schema: IR.SchemaObject;
}
