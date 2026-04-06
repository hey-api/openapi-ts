import type { ReleaseGroup } from '../assemble/grouper.js';
import { repo } from '../config.js';
import type { Contributor } from './contributors.js';

export interface ReleaseNotes {
  body: string;
  tag: string;
  title: string;
}

function extractEntriesFromContent(content: string): Array<string> {
  const lines = content.split('\n');
  const entries: Array<string> = [];
  let currentEntry: Array<string> = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      currentEntry.push(line);
      continue;
    }

    if (inCodeBlock) {
      currentEntry.push(line);
      continue;
    }

    // Start of new section or version header
    if (line.match(/^#{1,3}\s/)) {
      if (currentEntry.length > 0) {
        entries.push(currentEntry.join('\n').trim());
        currentEntry = [];
      }
      continue;
    }

    // Bullet points are entries
    if (line.match(/^-\s/) || line.match(/^\*\s/)) {
      if (currentEntry.length > 0 && !currentEntry[currentEntry.length - 1].match(/^-\s/)) {
        // Previous was description, save it
        entries.push(currentEntry.join('\n').trim());
        currentEntry = [];
      }
      currentEntry.push(line);
    } else if (currentEntry.length > 0) {
      // Continuation of previous entry
      currentEntry.push(line);
    }
  }

  if (currentEntry.length > 0) {
    entries.push(currentEntry.join('\n').trim());
  }

  return entries;
}

export function formatReleaseNotes(
  releaseGroup: ReleaseGroup,
  contributors: Array<Contributor>,
): ReleaseNotes {
  const lines: Array<string> = [];

  lines.push(`## ${releaseGroup.tag}`);
  lines.push('');

  // Filter out packages with no user-facing changes
  const packagesWithChanges = releaseGroup.packages.filter((p) => p.hasUserFacingChanges);

  for (const pkg of packagesWithChanges) {
    lines.push(`### @hey-api/${pkg.name.replace('@hey-api/', '')} ${pkg.version}`);
    lines.push('');

    // Extract entries from content
    const entries = extractEntriesFromContent(pkg.content);
    for (const entry of entries) {
      // Skip section headers, keep only actual change entries
      if (entry.includes('\n') || entry.startsWith('- ') || entry.startsWith('* ')) {
        lines.push(entry);
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
  }

  // Add contributors
  if (contributors.length > 0) {
    lines.push('## Contributors');
    lines.push('');
    // Just list contributors without PR numbers (cleaner for release notes)
    const names = contributors.map((c) => `@${c.username}`);
    if (names.length === 1) {
      lines.push(`Thanks to ${names[0]}!`);
    } else {
      const last = names.pop();
      lines.push(`Thanks to ${names.join(', ')}, and ${last}!`);
    }
    lines.push('');
  }

  // Add link to full changelog
  lines.push(`[Full changelog →](https://github.com/${repo}/blob/main/CHANGELOG.md)`);

  return {
    body: lines.join('\n').trim(),
    tag: releaseGroup.tag,
    title: `Release ${releaseGroup.tag}`,
  };
}
