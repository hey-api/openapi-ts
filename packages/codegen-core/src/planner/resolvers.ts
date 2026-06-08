import type { NameConflictResolver } from './types';

export const pythonNameConflictResolver: NameConflictResolver = ({ attempt, baseName }) =>
  attempt === 1 ? `${baseName}_` : `${baseName}_${attempt}`;

export const simpleNameConflictResolver: NameConflictResolver = ({ attempt, baseName }) =>
  `${baseName}${attempt + 1}`;

export const underscoreNameConflictResolver: NameConflictResolver = ({ attempt, baseName }) =>
  `${baseName}_${attempt + 1}`;
