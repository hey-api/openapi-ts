import type { Release } from './types';

export function getPullRequestsFromRelease(release: Release): Array<number> {
  const pullRequests = new Set<number>();

  for (const pkg of release.packages) {
    for (const entry of pkg.entries) {
      if (entry.pullRequest !== undefined) {
        pullRequests.add(entry.pullRequest);
      }
    }
  }

  return Array.from(pullRequests);
}
