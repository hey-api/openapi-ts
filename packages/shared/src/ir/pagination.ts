import type { Parser } from '../config/parser/types';
import type { IR } from './types';

export function getPaginationKeywordsRegExp(
  pagination: Parser['pagination'],
): RegExp {
  const pattern = `^(${pagination.keywords.join('|')})$`;
  return new RegExp(pattern);
}

export interface Pagination {
  in: 'body' | 'cookie' | 'header' | 'path' | 'query';
  name: string;
  schema: IR.SchemaObject;
}
