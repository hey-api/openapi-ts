import { underscoreNameConflictResolver } from '../planner/resolvers';
import type { NameConflictResolvers } from './types';

export const defaultNameConflictResolvers: NameConflictResolvers = {
  php: underscoreNameConflictResolver,
  python: underscoreNameConflictResolver,
  ruby: underscoreNameConflictResolver,
};
