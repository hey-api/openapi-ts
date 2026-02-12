import type { AnyString } from '@hey-api/types';

import type { NameConflictResolver } from '../planner/types';

/**
 * Map of extensions for each language.
 *
 * @example
 * ```ts
 * const exts: Extensions = {
 *   typescript: ['.ts', '.tsx'],
 *   python: ['.py'],
 * };
 * ```
 */
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

/**
 * Map of module entry names for each language.
 *
 * @example
 * ```ts
 * const entries: ModuleEntryNames = {
 *   typescript: 'index',
 *   python: '__init__',
 * };
 * ```
 */
export type ModuleEntryNames = Partial<Record<Language, string>>;

export type NameConflictResolvers = Partial<Record<Language, NameConflictResolver>>;
