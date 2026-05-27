import { pythonNameConflictResolver, underscoreNameConflictResolver } from '../planner/resolvers';
import type { NameConflictResolvers } from './types';

export const defaultNameConflictResolvers: NameConflictResolvers = {
  php: underscoreNameConflictResolver,
  python: pythonNameConflictResolver,
  ruby: underscoreNameConflictResolver,
};
