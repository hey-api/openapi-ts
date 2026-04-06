import { readFileSync } from 'node:fs';

import type { SemverType } from './config.js';

export interface ParsedChangeset {
  description: string;
  id: string;
  isBreaking: boolean;
  packages: Map<string, SemverType>;
  prNumber: number | null;
  rawScope: string | null;
  summary: string;
}

function parseFrontmatter(content: string): Map<string, SemverType> {
  const packages = new Map<string, SemverType>();

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return packages;

  const lines = frontmatterMatch[1].split('\n');
  for (const line of lines) {
    const match = line.match(/^"(@hey-api\/[^"]+)":\s*(major|minor|patch)/);
    if (match) {
      packages.set(match[1], match[2] as SemverType);
    }
  }

  return packages;
}

function extractPrNumber(summary: string): number | null {
  const match = summary.match(/\(#(\d+)\)$/);
  return match ? parseInt(match[1], 10) : null;
}

function parseSummary(summary: string): {
  description: string;
  isBreaking: boolean;
  rawScope: string | null;
} {
  // Handle **scope**: description format
  const boldMatch = summary.match(/^\*\*([^:]+)\*\*:?\s*(.*)$/);

  if (boldMatch) {
    const rawScope = boldMatch[1];
    const description = boldMatch[2];

    // Check for BREAKING in the scope itself (e.g., **BREAKING**: ...)
    const isBreaking = rawScope.toLowerCase().includes('breaking');

    return { description, isBreaking, rawScope };
  }

  // No scope, just description
  return { description: summary, isBreaking: false, rawScope: null };
}

export function parseChangesetContent(content: string, id: string): ParsedChangeset {
  const packages = parseFrontmatter(content);

  // Remove frontmatter to get summary
  const body = content.replace(/^---\n[\s\S]*?\n---/, '').trim();

  // Get first line as summary (ignoring multi-line details for now)
  const firstLine = body.split('\n')[0].trim();

  const { description, isBreaking: scopeBreaking, rawScope } = parseSummary(firstLine);
  const prNumber = extractPrNumber(firstLine);

  // Check for BREAKING in content itself
  const hasBreakingKeyword =
    /^BREAKING[:\s]/i.test(firstLine) || /\bBREAKING CHANGE\b/i.test(firstLine);

  return {
    description,
    id,
    isBreaking: scopeBreaking || hasBreakingKeyword,
    packages,
    prNumber,
    rawScope,
    summary: firstLine,
  };
}

export function parseChangeset(filepath: string): ParsedChangeset {
  const content = readFileSync(filepath, 'utf-8');
  const id = filepath.split('/').pop()?.replace(/\.md$/, '') ?? '';
  return parseChangesetContent(content, id);
}
