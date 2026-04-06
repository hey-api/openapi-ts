import { execSync } from 'node:child_process';

import { packageOrder } from '../config.js';
import type { PackageChangelog } from './reader.js';

export interface ReleaseGroup {
  date: string;
  packages: Array<{
    content: string;
    entries: Array<ParsedEntry>;
    hasUserFacingChanges: boolean;
    name: string;
    version: string;
  }>;
  tag: string;
}

export interface ParsedEntry {
  category: 'Breaking' | 'Added' | 'Fixed' | 'Changed';
  description: string;
  prNumber: number | null;
  scope: string | null;
  section: 'Core' | 'Plugins' | 'Other';
}

interface TagInfo {
  date: string;
  package: string;
  version: string;
}

function getGitTags(): Array<TagInfo> {
  try {
    const output = execSync('git tag --list', { encoding: 'utf-8' });
    const tags = output.split('\n').filter(Boolean);

    const result: Array<TagInfo> = [];
    for (const tag of tags) {
      // Match pattern: @hey-api/package@version (e.g., @hey-api/openapi-ts@0.95.0)
      const match = tag.match(/^@hey-api\/([^@]+)@(\d+\.\d+\.\d+)$/);
      if (match) {
        // Get tag date
        const dateOutput = execSync(`git log -1 --format=%ci ${tag}`, { encoding: 'utf-8' });
        const date = dateOutput.trim().split(' ')[0]; // Get YYYY-MM-DD

        result.push({
          date,
          package: `@hey-api/${match[1]}`,
          version: match[2],
        });
      }
    }

    return result;
  } catch {
    return [];
  }
}

function parseEntryFromLine(line: string): ParsedEntry | null {
  // Match changelog entry format:
  // Old: - **scope**: description [#PR](url) [`commit`](url) by [@author](url)
  // New: - **scope**: description (#PR)

  // Extract scope from **scope**: pattern
  const scopeMatch = line.match(/^\s*-\s+\*\*([^:]+)\*\*:?\s*/);
  const scope = scopeMatch ? scopeMatch[1] : null;

  // Get the content after the scope (or after dash for no-scope)
  const contentMatch = scope
    ? line.match(/^\s*-\s+\*\*[^:]+\*\*:?\s+(.+)$/)
    : line.match(/^\s*-\s+(.+)$/);

  if (!contentMatch) return null;

  let content = contentMatch[1];

  // Step 1: Extract PR number - look for patterns like [#1234](url) or (#1234)
  let prNumber: number | null = null;
  const prMatch1 = content.match(/\[#(\d+)\]\([^)]+\)/);
  if (prMatch1) {
    prNumber = parseInt(prMatch1[1], 10);
  } else {
    const prMatch2 = content.match(/\(#(\d+)\)/);
    if (prMatch2) {
      prNumber = parseInt(prMatch2[1], 10);
    }
  }

  // Step 2: Clean up in specific order
  // A. Remove author patterns: " by [@user]" OR "[by @user](url)" OR " by [@user](url)"
  content = content.replace(/\s+by\s+\[@[^\]]+\](?:\([^)]+\))?/gi, '');
  content = content.replace(/\[by\s+@[^\]]+\]\([^)]+\)/gi, '');

  // B. Remove PR link patterns: [#PR](url) OR (#PR)
  content = content.replace(/\[#\d+\]\([^)]+\)/g, '');
  content = content.replace(/\(\s*#\d+\s*\)/g, '');

  // C. Remove commit patterns: [`commit`](url) OR `commit`
  content = content.replace(/\[`[a-f0-9]+`\]\([^)]+\)/gi, '');
  content = content.replace(/`[a-f0-9]+`/gi, '');

  // D. Remove any remaining markdown links keeping text
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // E. Clean up: remove empty parentheses, whitespace, and leading punctuation
  content = content.replace(/\(\s*\)/g, ''); // Remove empty ()
  content = content.replace(/\s+/g, ' ').trim();
  content = content.replace(/^[-:]\s*/, '').trim();

  const description = content;

  // Filter out dependency-only entries (e.g., "- @hey-api/shared@0.3.0")
  if (!scope && /^@hey-api\/[^@]+@\d+\.\d+\.\d+$/.test(description)) {
    return null;
  }

  if (!description) return null;

  // Detect section from scope
  let section: 'Core' | 'Plugins' | 'Other' = 'Other';
  if (scope && /^plugin\(/.test(scope)) {
    section = 'Plugins';
  } else if (
    scope &&
    [
      'cli',
      'config',
      'error',
      'input',
      'internal',
      'output',
      'parser',
      'planner',
      'project',
      'symbols',
      'build',
    ].includes(scope)
  ) {
    section = 'Core';
  }

  // Detect category from description keywords or scope
  let category: 'Breaking' | 'Added' | 'Fixed' | 'Changed' = 'Changed';
  if (/BREAKING/i.test(description) || (scope && /BREAKING/i.test(scope))) {
    category = 'Breaking';
  } else if (/^feat[\s:]/i.test(description) || /^(feat|add)\b/i.test(description)) {
    category = 'Added';
  } else if (/^fix[\s:]/i.test(description) || /^fix\b/i.test(description)) {
    category = 'Fixed';
  }

  return { category, description, prNumber, scope, section };
}

function extractEntries(content: string): Array<ParsedEntry> {
  const entries: Array<ParsedEntry> = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const entry = parseEntryFromLine(line.trim());
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

export function groupByRelease(changelogs: Map<string, PackageChangelog>): Array<ReleaseGroup> {
  // Get all git tags with dates
  const tags = getGitTags();

  // Group tags by date
  const dateGroups = new Map<string, Array<TagInfo>>();
  for (const tag of tags) {
    if (!dateGroups.has(tag.date)) {
      dateGroups.set(tag.date, []);
    }
    dateGroups.get(tag.date)!.push(tag);
  }

  // Sort dates descending (newest first)
  const sortedDates = Array.from(dateGroups.keys()).sort().reverse();

  const releaseGroups: Array<ReleaseGroup> = [];

  for (const date of sortedDates) {
    const tagsInGroup = dateGroups.get(date)!;

    // Sort packages by packageOrder
    const sortedPackages = tagsInGroup
      .sort((a, b) => {
        const aIdx = packageOrder.indexOf(a.package as (typeof packageOrder)[number]);
        const bIdx = packageOrder.indexOf(b.package as (typeof packageOrder)[number]);
        return aIdx - bIdx;
      })
      .filter((t) => packageOrder.includes(t.package as (typeof packageOrder)[number]));

    // Build package list from tags
    const packages: ReleaseGroup['packages'] = [];

    for (const tagInfo of sortedPackages) {
      const changelog = changelogs.get(tagInfo.package);
      if (!changelog) continue;

      const versionData = changelog.versions.find((v) => v.version === tagInfo.version);
      if (!versionData) continue;

      const entries = extractEntries(versionData.content);

      packages.push({
        content: versionData.content,
        entries,
        hasUserFacingChanges: versionData.hasUserFacingChanges,
        name: tagInfo.package,
        version: tagInfo.version,
      });
    }

    if (packages.length > 0) {
      // Generate tag from date + sequence (placeholder for release workflow)
      releaseGroups.push({
        date,
        packages,
        // Placeholder - will be overridden by release tag
        tag: `${date}.${packages.length}`,
      });
    }
  }

  return releaseGroups;
}
