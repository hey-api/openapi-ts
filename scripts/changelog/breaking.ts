import { type SemverType, v0MinorBreakingSignals } from './config.js';

export interface ParsedChangeset {
  description: string;
  id: string;
  isBreaking: boolean;
  packages: Map<string, SemverType>;
  prNumber: number | null;
  rawScope: string | null;
  summary: string;
}

export function isBreakingChange(changeset: ParsedChangeset, packageVersion: string): boolean {
  // Explicit BREAKING marker in content
  if (changeset.isBreaking) {
    return true;
  }

  // Check all packages in changeset for their bump types
  for (const [, semverType] of Array.from(changeset.packages.entries())) {
    if (semverType === 'major') {
      return true;
    }

    // For v0 packages, minor bumps can be breaking
    if (packageVersion.startsWith('0.')) {
      if (semverType === 'minor') {
        // Check for breaking signal words in description
        const descLower = changeset.description.toLowerCase();
        for (const signal of v0MinorBreakingSignals) {
          if (signal.test(descLower)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
