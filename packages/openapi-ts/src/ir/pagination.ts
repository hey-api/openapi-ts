import type { Config } from '../types/config';
import type { IR } from './types';

export const DEFAULT_PAGINATION_KEYWORDS = [
  'after',
  'before',
  'cursor',
  'offset',
  'page',
  'start',
];

export function getPaginationKeywordsRegExp(config?: Config): RegExp {
  const configKeywords = config?.input?.pagination?.keywords;
  const keywords = configKeywords || DEFAULT_PAGINATION_KEYWORDS;
  const pattern = `^(${keywords.join('|')})$`;
  return new RegExp(pattern);
}

export interface Pagination {
  in: string;
  name: string;
  schema: IR.SchemaObject;
}
