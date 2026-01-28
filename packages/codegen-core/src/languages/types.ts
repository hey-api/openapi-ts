import type { AnyString } from '@hey-api/types';

import type { NameConflictResolver } from '../planner/types';

export type Extensions = Partial<Record<Language, ReadonlyArray<string>>>;

export type Language =
  | 'c'
  | 'c#'
  | 'c++'
  | 'css'
  | 'dart'
  | 'go'
  | 'haskell'
  | 'html'
  | 'java'
  | 'javascript'
  | 'json'
  | 'kotlin'
  | 'lua'
  | 'markdown'
  | 'matlab'
  | 'perl'
  | 'php'
  | 'python'
  | 'r'
  | 'ruby'
  | 'rust'
  | 'scala'
  | 'shell'
  | 'sql'
  | 'swift'
  | 'typescript'
  | 'yaml'
  | AnyString; // other/custom language

export type NameConflictResolvers = Partial<
  Record<Language, NameConflictResolver>
>;
