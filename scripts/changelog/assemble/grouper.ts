import { execSync } from 'node:child_process';

import { getChangelogPackages } from '../config';
import { getAllTags } from '../release/tag';
import type { Changelogs } from './reader';

export interface ReleaseGroup {
  date: string;
  packages: Array<ReleasePackage>;
  tag: string;
}

export interface ReleasePackage {
  content: string;
  entries: Array<ParsedEntry>;
  hasUserFacingChanges: boolean;
  packageName: string;
  version: string;
}

export interface ParsedEntry {
  category: 'Breaking' | 'Added' | 'Fixed' | 'Changed';
  description: string;
  prNumber: number | undefined;
  scope: string | undefined;
  section: string | undefined;
}

interface TagInfo {
  /** The date of the tag in YYYY-MM-DD format. */
  date: string;
  /** The name of the package associated with the tag. */
  packageName: string;
  /** Parsed timestamp used for deterministic sorting. */
  timestamp: number;
  /** The version of the package associated with the tag. */
  version: string;
}

const LEGACY_TAG_MAIN_PACKAGE = '@hey-api/openapi-ts';

function getPackageBaseName(packageName: string): string {
  if (packageName.startsWith('@') && packageName.includes('/')) {
    return packageName.split('/')[1]!;
  }
  return packageName;
}

export function isFlagshipPackage(packageName: string): boolean {
  const baseName = getPackageBaseName(packageName);
  return baseName.startsWith('openapi-');
}

function getPackageGroupRank(packageName: string): number {
  return isFlagshipPackage(packageName) ? 0 : 1;
}

function getTagDate(tag: string): Pick<TagInfo, 'date' | 'timestamp'> {
  const fullDate = execSync(`git log -1 --format=%ci ${tag}`, { encoding: 'utf-8' }).trim();

  const timestamp = getTimestamp(fullDate);
  if (timestamp > 0) {
    const normalized = new Date(timestamp).toISOString();
    const date = normalized.slice(0, 10);
    return {
      date,
      timestamp,
    };
  }

  const match = fullDate.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  const date = match?.[1] ?? fullDate;
  return {
    date,
    timestamp: 0,
  };
}

function getTimestamp(fullDate: string): number {
  const match = fullDate.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{2})(\d{2})$/);
  if (!match) {
    return Date.parse(fullDate) || 0;
  }

  const [, date, time, offsetHour, offsetMinute] = match;
  const iso = `${date}T${time}${offsetHour}:${offsetMinute}`;
  return Date.parse(iso) || 0;
}

function getLegacyTagPackageName(): string | undefined {
  const packages = getChangelogPackages();
  return packages.find((pkg) => pkg.name === LEGACY_TAG_MAIN_PACKAGE)?.name;
}

function getGitTags(): Array<TagInfo> {
  try {
    const tags = getAllTags();
    const legacyTagPackage = getLegacyTagPackageName();

    const results: Array<TagInfo> = [];
    for (const tag of tags) {
      // Match pattern: <package-name>@<version> (e.g., @hey-api/types@0.1.4)
      const packageTagMatch = tag.match(/^(.+)@(\d+\.\d+\.\d+)$/);
      if (packageTagMatch) {
        results.push({
          ...getTagDate(tag),
          packageName: packageTagMatch[1],
          version: packageTagMatch[2],
        });

        continue;
      }

      if (legacyTagPackage) {
        // Match legacy pattern: v<version> (e.g., v0.29.0)
        const legacyTagMatch = tag.match(/^v(\d+\.\d+\.\d+)$/);
        if (legacyTagMatch) {
          results.push({
            ...getTagDate(tag),
            packageName: legacyTagPackage,
            version: legacyTagMatch[1],
          });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}

function parseEntryFromLine(line: string): ParsedEntry | undefined {
  let scope: string | undefined;
  let content: string | undefined;

  // - **scope**: content
  const boldScopeMatch = line.match(/^\s*-\s+\*\*([^:]+)\*\*:\s+(.+)$/);
  if (boldScopeMatch) {
    scope = boldScopeMatch[1];
    content = boldScopeMatch[2];
  } else {
    // - scope: content
    const plainScopeMatch = line.match(/^\s*-\s+([^:]+):\s+(.+)$/);
    if (plainScopeMatch) {
      scope = plainScopeMatch[1];
      content = plainScopeMatch[2];
    } else {
      // - content
      const noScopeMatch = line.match(/^\s*-\s+(.+)$/);
      if (noScopeMatch) {
        content = noScopeMatch[1];
      }
    }
  }

  if (!content) return;

  // [#1234](url) or (#1234)
  const prMatch = content.match(/\[#(\d+)\]\([^)]+\)|\(#(\d+)\)/);
  const prValue = prMatch?.[1] ?? prMatch?.[2];
  const prNumber = prValue ? Number.parseInt(prValue, 10) : undefined;

  // remove trailing author pattern: " by [@user]" or " by [@user](url)"
  content = content.replace(/\s+by\s+\[@[^\]]+\](?:\([^)]+\))?/gi, '');

  // remove PR link patterns, optionally wrapped in extra parentheses
  content = content.replace(/\(?\s*(?:\[#\d+\]\([^)]+\)|\(\s*#\d+\s*\))\s*\)?/g, '');

  // remove commit patterns, optionally wrapped in extra parentheses
  content = content.replace(/\(?\s*(?:\[`[a-f0-9]+`\]\([^)]+\)|`[a-f0-9]+`)\s*\)?/gi, '');

  // remove only a leading '- ' prefix
  content = content.replace(/^- /, '').trim();

  if (!content) return;

  let section: string | undefined;
  if (scope && /^plugin\(/.test(scope)) {
    section = 'Plugins';
  }

  // Detect category from content keywords or scope
  let category: 'Breaking' | 'Added' | 'Fixed' | 'Changed' = 'Changed';
  if (/BREAKING/i.test(content) || (scope && /BREAKING/i.test(scope))) {
    category = 'Breaking';
  } else if (/^feat[\s:]/i.test(content) || /^(feat|add)\b/i.test(content)) {
    category = 'Added';
  } else if (/^fix[\s:]/i.test(content) || /^fix\b/i.test(content)) {
    category = 'Fixed';
  }

  return { category, description: content, prNumber, scope, section };
}

function extractEntries(content: string): Array<ParsedEntry> {
  const entries: Array<ParsedEntry> = [];
  // Strip changelog structural headings before parsing so they don't attach to entry bodies
  const cleanedContent = content.replace(/^### (?:Minor|Major|Patch) Changes\s*$/gm, '');
  const lines = cleanedContent.split('\n');

  let currentBlock: Array<string> = [];

  const flushCurrentBlock = () => {
    if (!currentBlock.length) return;

    const parsed = parseEntryFromLine(currentBlock[0]!);
    if (parsed) {
      entries.push({
        ...parsed,
        description: [parsed.description, currentBlock.slice(1).join('\n')]
          .filter(Boolean)
          .join('\n'),
      });
    }

    currentBlock = [];
  };

  for (const line of lines) {
    if (/^-\s+/.test(line)) {
      flushCurrentBlock();
    }
    currentBlock.push(line);
  }

  flushCurrentBlock();

  return entries;
}

export function groupByRelease(changelogs: Changelogs): Array<ReleaseGroup> {
  const tags = getGitTags();

  const dateGroups = new Map<string, Array<TagInfo>>();
  for (const tag of tags) {
    if (!dateGroups.has(tag.date)) {
      dateGroups.set(tag.date, []);
    }
    dateGroups.get(tag.date)!.push(tag);
  }

  const sortedDates = Array.from(dateGroups.keys()).sort((a, b) => {
    const aLatest = Math.max(...dateGroups.get(a)!.map((tag) => tag.timestamp));
    const bLatest = Math.max(...dateGroups.get(b)!.map((tag) => tag.timestamp));
    if (aLatest === bLatest) return b.localeCompare(a);
    return bLatest - aLatest;
  });

  const knownPackages = new Set(getChangelogPackages().map((pkg) => pkg.name));
  const releaseGroups: Array<ReleaseGroup> = [];

  for (const date of sortedDates) {
    const sortedPackages = dateGroups
      .get(date)!
      .filter((tag) => knownPackages.has(tag.packageName))
      .sort((a, b) => {
        const aGroup = getPackageGroupRank(a.packageName);
        const bGroup = getPackageGroupRank(b.packageName);
        if (aGroup !== bGroup) return aGroup - bGroup;

        const nameCompare = a.packageName.localeCompare(b.packageName);
        if (nameCompare !== 0) return nameCompare;

        return b.timestamp - a.timestamp;
      });

    const packages: Array<ReleasePackage> = [];

    for (const tagInfo of sortedPackages) {
      const changelog = changelogs.get(tagInfo.packageName);
      if (!changelog) continue;

      const release = changelog.releases.find((r) => r.version === tagInfo.version);
      if (!release) continue;

      packages.push({
        content: release.content,
        entries: extractEntries(release.content),
        hasUserFacingChanges: release.hasUserFacingChanges,
        packageName: tagInfo.packageName,
        version: tagInfo.version,
      });
    }

    if (packages.length) {
      releaseGroups.push({
        date,
        packages,
        tag: `${date}.placeholder`, // release tag will override
      });
    }
  }

  return releaseGroups;
}
