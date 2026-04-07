import { execSync } from 'node:child_process';

export interface Contributor {
  prNumbers: Array<number>;
  username: string;
}

const AGENT_USERS = new Set(['copilot-swe-agent']);

export async function getContributorsFromPullRequests(
  prNumbers: Array<number>,
): Promise<Array<Contributor>> {
  const contributorsMap = new Map<string, Array<number>>();

  for (const pr of prNumbers) {
    try {
      // Use gh to get PR info (faster than hitting API directly)
      const output = execSync(`gh pr view ${pr} --json author --jq '.author.login'`, {
        encoding: 'utf-8',
      }).trim();

      if (output && !output.includes('[bot]') && !AGENT_USERS.has(output)) {
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
