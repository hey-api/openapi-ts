import type { ChangelogEntry, EntryCategory, EntrySection } from './types';

function consumeLeadingBreakingMarker(value: string): { isBreaking: boolean; value: string } {
  const nextValue = value.replace(/^\s*(?:\*\*BREAKING:?\*\*:?|BREAKING:)\s*/i, '');

  if (nextValue === value) {
    return {
      isBreaking: false,
      value,
    };
  }

  return {
    isBreaking: true,
    value: nextValue,
  };
}

function parseContentLine(line: string): ChangelogEntry | undefined {
  const bulletMatch = line.match(/^\s*-\s+(.+)$/);
  if (!bulletMatch) return;

  const strippedLine = bulletMatch[1]!.trim();
  const { isBreaking: hasLeadingBreakingMarker, value: normalizedLine } =
    consumeLeadingBreakingMarker(strippedLine);

  let scope: string | undefined;
  let content: string | undefined;

  // **scope**: content
  const boldScopeMatch = normalizedLine.match(/^\*\*([^*]+)\*\*:\s+(.+)$/);
  if (boldScopeMatch) {
    scope = boldScopeMatch[1];
    content = boldScopeMatch[2];
  } else {
    // scope: content
    const plainScopeMatch = normalizedLine.match(/^([^:]+):\s+(.+)$/);
    if (plainScopeMatch) {
      scope = plainScopeMatch[1];
      content = plainScopeMatch[2];
    } else {
      content = normalizedLine;
    }
  }

  if (!content) return;

  const { isBreaking: hasScopedBreakingMarker, value: normalizedContent } =
    consumeLeadingBreakingMarker(content);
  content = normalizedContent;

  // [#1234](url) or (#1234)
  const prMatch = content.match(/\[#(\d+)\]\([^)]+\)|\(#(\d+)\)/);
  const prValue = prMatch?.[1] ?? prMatch?.[2];
  const pullRequest = prValue ? Number.parseInt(prValue, 10) : undefined;

  // remove trailing author pattern: " by [@user]" or " by [@user](url)"
  content = content.replace(/\s+by\s+\[@[^\]]+\](?:\([^)]+\))?/gi, '');

  // remove PR link patterns, optionally wrapped in extra parentheses
  content = content.replace(/\(?\s*(?:\[#\d+\]\([^)]+\)|\(\s*#\d+\s*\))\s*\)?/g, '');

  // remove commit patterns, optionally wrapped in extra parentheses
  content = content.replace(/\(?\s*(?:\[`[a-f0-9]+`\]\([^)]+\)|`[a-f0-9]+`)\s*\)?/gi, '');

  // remove only a leading '- ' prefix
  content = content.replace(/^- /, '').trim();

  if (!content && !hasLeadingBreakingMarker && !hasScopedBreakingMarker) return;

  let section: EntrySection | undefined;
  if (scope && /^plugin\(/.test(scope)) {
    section = 'Plugins';
  }

  let category: EntryCategory = 'Changed';
  if (hasLeadingBreakingMarker || hasScopedBreakingMarker) {
    category = 'Breaking';
  } else if (/^feat[\s:]/i.test(content) || /^(feat|add)\b/i.test(content)) {
    category = 'Added';
  } else if (/^fix[\s:]/i.test(content) || /^fix\b/i.test(content)) {
    category = 'Fixed';
  }

  return { category, description: content, pullRequest, scope, section };
}

export function extractChangelogEntries(content: string): Array<ChangelogEntry> {
  const entries: Array<ChangelogEntry> = [];
  // strip changelog structural headings from changesets
  const cleanedContent = content.replace(/^### (?:Minor|Major|Patch) Changes\s*(?:\r?\n|$)/gm, '');
  const lines = cleanedContent.split('\n');

  let currentBlock: Array<string> = [];

  const flushCurrentBlock = () => {
    if (!currentBlock.length) return;

    const parsed = parseContentLine(currentBlock[0]!);
    if (parsed) {
      entries.push({
        ...parsed,
        description: [parsed.description, currentBlock.slice(1).join('\n')]
          .filter(Boolean)
          .join('\n')
          .trim(),
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
