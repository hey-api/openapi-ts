import type { Config } from '../types/config';
import type { IR } from './types';

export function getPaginationKeywordsRegExp(
  pagination: Config['parser']['pagination'],
): RegExp {
  const pattern = `^(${pagination.keywords.join('|')})$`;
  return new RegExp(pattern);
}

export interface Pagination {
  in: 'body' | 'cookie' | 'header' | 'path' | 'query';
  name: string;
  schema: IR.SchemaObject;
}
