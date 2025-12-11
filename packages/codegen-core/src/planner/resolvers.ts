import type { NameConflictResolver } from './types';

export const simpleNameConflictResolver: NameConflictResolver = ({
  attempt,
  baseName,
}) => (attempt === 0 ? baseName : `${baseName}${attempt + 1}`);

export const underscoreNameConflictResolver: NameConflictResolver = ({
  attempt,
  baseName,
}) => (attempt === 0 ? baseName : `${baseName}_${attempt + 1}`);
