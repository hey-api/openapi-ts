import type { SemverType } from './config.js';
import {
  breakingPatterns,
  repo,
  sectionMap,
  sectionOrder,
  sectionPatterns,
  semverFallback,
} from './config.js';

export type Category = 'Breaking' | 'Added' | 'Fixed' | 'Changed';

export interface FormattedEntry {
  category: Category;
  description: string;
  prNumber: number | null;
  scope: string | null;
  section: string;
}

export function detectCategory(
  changeset: { description: string; isBreaking: boolean },
  semverType: SemverType,
): Category {
  // Explicit breaking
  if (changeset.isBreaking) {
    return 'Breaking';
  }

  // Check for explicit BREAKING in description
  for (const pattern of breakingPatterns) {
    if (pattern.test(changeset.description)) {
      return 'Breaking';
    }
  }

  // Fallback to semver
  return semverFallback[semverType] as Category;
}

export function detectSection(scope: string | null): string {
  if (!scope) return 'Other';

  // Check exact matches first
  if (scope in sectionMap) {
    return sectionMap[scope];
  }

  // Check patterns
  for (const [pattern, section] of sectionPatterns) {
    if (pattern.test(scope)) {
      return section;
    }
  }

  return 'Other';
}

export function formatEntry(
  changeset: {
    description: string;
    isBreaking: boolean;
    packages: Map<string, SemverType>;
    prNumber: number | null;
    rawScope: string | null;
  },
  packageName: string,
): FormattedEntry {
  const semverType = changeset.packages.get(packageName) ?? 'patch';
  const category = detectCategory(changeset, semverType);
  const section = detectSection(changeset.rawScope);

  return {
    category,
    description: changeset.description,
    prNumber: changeset.prNumber,
    scope: changeset.rawScope,
    section,
  };
}

export function entryToMarkdown(entry: FormattedEntry): string {
  const parts: Array<string> = [];

  if (entry.scope) {
    parts.push(`**${entry.scope}**: ${entry.description}`);
  } else {
    parts.push(entry.description);
  }

  if (entry.prNumber) {
    parts.push(`([#${entry.prNumber}](https://github.com/${repo}/pull/${entry.prNumber}))`);
  }

  return `- ${parts.join(' ')}`;
}

export function groupEntriesBySection(
  entries: Array<FormattedEntry>,
): Map<string, Map<Category, Array<FormattedEntry>>> {
  const grouped = new Map<string, Map<Category, Array<FormattedEntry>>>();

  for (const entry of entries) {
    if (!grouped.has(entry.section)) {
      grouped.set(entry.section, new Map());
    }
    const sectionGroup = grouped.get(entry.section)!;

    if (!sectionGroup.has(entry.category)) {
      sectionGroup.set(entry.category, []);
    }
    sectionGroup.get(entry.category)!.push(entry);
  }

  return grouped;
}

export function formatVersionBlock(
  packageName: string,
  version: string,
  entries: Array<FormattedEntry>,
): string {
  const grouped = groupEntriesBySection(entries);
  const lines: Array<string> = [];

  lines.push(`## ${packageName} ${version}`);

  // Process sections in configured order
  for (const section of sectionOrder) {
    const sectionEntries = grouped.get(section);
    if (!sectionEntries) continue;

    // Process categories in order: Breaking, Added, Fixed, Changed
    const categoryOrder: Array<Category> = ['Breaking', 'Added', 'Fixed', 'Changed'];

    for (const category of categoryOrder) {
      const categoryEntries = sectionEntries.get(category);
      if (!categoryEntries?.length) continue;

      // Skip empty Breaking category unless there are breaking changes
      if (category === 'Breaking') {
        lines.push('\n### ⚠️ Breaking');
      } else {
        lines.push(`\n### ${category}`);
      }

      for (const entry of categoryEntries) {
        lines.push(entryToMarkdown(entry));
      }
    }
  }

  return lines.join('\n');
}

// Changesets integration
export async function getReleaseLine(
  changeset: { releases?: Array<{ name: string; type: SemverType }>; summary: string },
  type: SemverType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: { repo?: string },
): Promise<string> {
  const { getInfoFromPullRequest } = await import('@changesets/get-github-info');

  // Parse changeset summary
  const summary = changeset.summary;
  const prMatch = summary.match(/\(#(\d+)\)$/);
  const prNumber = prMatch ? parseInt(prMatch[1], 10) : null;

  // Remove PR reference for clean output
  const cleanSummary = summary.replace(/\s*\(#\d+\)$/, '');

  // Parse scope from **scope**: format
  const scopeMatch = cleanSummary.match(/^\*\*([^:]+)\*\*:?\s*(.*)$/);
  const scope = scopeMatch ? scopeMatch[1] : null;
  const description = scopeMatch ? scopeMatch[2] : cleanSummary;

  // Detect breaking
  const isBreaking =
    /^BREAKING[:\s]/i.test(cleanSummary) || /\bBREAKING CHANGE\b/i.test(cleanSummary);

  // Get semver type from changeset
  const semverType = changeset.releases?.[0]?.type || type;

  const entry: FormattedEntry = {
    category: detectCategory({ description, isBreaking }, semverType),
    description,
    prNumber,
    scope,
    section: detectSection(scope),
  };

  // Get PR info for links
  if (prNumber) {
    try {
      const { links } = await getInfoFromPullRequest({ pull: prNumber, repo });
      const prLink = links?.pull ? ` ([${links.pull}])` : '';
      const entryCopy = { ...entry, prNumber: null };
      return entryToMarkdown(entryCopy) + prLink;
    } catch {
      return entryToMarkdown(entry);
    }
  }

  return entryToMarkdown(entry);
}

export async function getDependencyReleaseLine(): Promise<string> {
  return '';
}
