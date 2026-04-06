import { execSync } from 'node:child_process';

export interface Contributor {
  prNumbers: Array<number>;
  username: string;
}

const BOT_USERS = new Set([
  'renovate[bot]',
  'dependabot[bot]',
  'github-actions[bot]',
  'copilot-swe-agent',
]);

export async function extractContributors(prNumbers: Array<number>): Promise<Array<Contributor>> {
  const contributorsMap = new Map<string, Array<number>>();

  for (const pr of prNumbers) {
    try {
      // Use gh to get PR info (faster than hitting API directly)
      const output = execSync(`gh pr view ${pr} --json author --jq '.author.login'`, {
        encoding: 'utf-8',
      }).trim();

      if (output && !BOT_USERS.has(output)) {
        const existing = contributorsMap.get(output) || [];
        existing.push(pr);
        contributorsMap.set(output, existing);
      }
    } catch {
      // Skip PRs that can't be fetched
    }
  }

  return Array.from(contributorsMap.entries()).map(([username, prNumbers]) => ({
    prNumbers,
    username,
  }));
}

export function formatContributors(contributors: Array<Contributor>): string {
  if (contributors.length === 0) return '';

  const names = contributors.map((c) => `@${c.username}`);
  if (names.length === 1) {
    return `Thanks to ${names[0]}!`;
  }

  const last = names.pop();
  return `Thanks to ${names.join(', ')}, and ${last}!`;
}
