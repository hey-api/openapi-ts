import { execSync } from 'node:child_process';
import fs from 'node:fs';

import { AGENT_USERS, CONFIG_PATH } from './config';
import type { ConfigFile, Contributor } from './types';

function getConfigFile(): ConfigFile {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export async function getContributorsFromPullRequests(
  pullRequests: Array<number>,
): Promise<Array<Contributor>> {
  const pullRequestsByGitHub = new Map<string, Array<number>>();
  const maintainers = new Set(getConfigFile().maintainers ?? []);

  for (const pullRequest of pullRequests) {
    try {
      // use gh, faster than hitting API directly
      const github = execSync(`gh pr view ${pullRequest} --json author --jq '.author.login'`, {
        encoding: 'utf-8',
      }).trim();

      if (
        github &&
        !github.includes('[bot]') &&
        !github.startsWith('app/') &&
        !AGENT_USERS.has(github) &&
        !maintainers.has(github)
      ) {
        const githubPullRequests = pullRequestsByGitHub.get(github) || [];
        githubPullRequests.push(pullRequest);
        pullRequestsByGitHub.set(github, githubPullRequests);
      }
    } catch {
      // skip pull requests that can't be fetched
    }
  }

  return Array.from(pullRequestsByGitHub.entries()).map(([github, pullRequests]) => ({
    github,
    pullRequests,
  }));
}
