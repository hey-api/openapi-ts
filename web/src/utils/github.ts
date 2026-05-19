import { getCached, setCached } from './cache';

async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<Response>,
  parser: (json: unknown) => T | null,
  fallback: T,
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== undefined) return cached ?? fallback;

  try {
    const res = await fetcher();

    if (!res.ok) {
      setCached(key, null);
      return fallback;
    }

    const json = await res.json();
    const value = parser(json);

    setCached(key, value);
    return value ?? fallback;
  } catch {
    setCached(key, null);
    return fallback;
  }
}

function githubRestHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/vnd.github+json' };
  if (import.meta.env.REACTIONS_GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${import.meta.env.REACTIONS_GITHUB_TOKEN}`;
  }
  return headers;
}

const POSITIVE_REACTIONS = [
  { emoji: '👍', key: '+1' },
  { emoji: '❤️', key: 'heart' },
  { emoji: '🎉', key: 'hooray' },
  { emoji: '🚀', key: 'rocket' },
  { emoji: '👀', key: 'eyes' },
] as const;

export type Reaction = { count: number; emoji: string };

export async function fetchIssueReactions(
  repo: string,
  issueNumber: number,
): Promise<Array<Reaction>> {
  return fetchCached(
    `github:reactions:${repo}:${issueNumber}`,
    () =>
      fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
        headers: githubRestHeaders(),
      }),
    (json) =>
      POSITIVE_REACTIONS.map(({ emoji, key }) => ({
        count: ((
          json as {
            reactions?: Record<string, number>;
          }
        ).reactions?.[key] ?? 0) as number,
        emoji,
      })).filter(({ count }) => count > 0),
    [],
  );
}

const SPONSORS_GOAL_QUERY = `{
  organization(login: "hey-api") {
    sponsorsListing {
      activeGoal {
        title
        percentComplete
        targetValue
        kind
      }
    }
  }
}`;

export type SponsorGoalKind = 'TOTAL_SPONSORS_COUNT' | 'MONTHLY_SPONSORSHIP_AMOUNT';

export interface SponsorGoal {
  kind: SponsorGoalKind;
  percentComplete: number;
  targetValue: number;
  title: string;
}

export async function fetchSponsorGoal(): Promise<SponsorGoal | null> {
  const token = import.meta.env.SPONSORS_GITHUB_TOKEN;
  if (!token) return null;

  return fetchCached(
    'sponsors:goal',
    () =>
      fetch('https://api.github.com/graphql', {
        body: JSON.stringify({ query: SPONSORS_GOAL_QUERY }),
        headers: {
          Authorization: `bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'hey-api-web',
        },
        method: 'POST',
      }),
    (json) =>
      (
        json as {
          data?: {
            organization?: {
              sponsorsListing?: {
                activeGoal?: SponsorGoal;
              };
            };
          };
        }
      )?.data?.organization?.sponsorsListing?.activeGoal ?? null,
    null,
  );
}

export async function fetchRepoStars(repo: string): Promise<number | null> {
  return fetchCached(
    `github:stars:${repo}`,
    () => fetch(`https://api.github.com/repos/${repo}`, { headers: githubRestHeaders() }),
    (json) =>
      (
        json as {
          stargazers_count?: number;
        }
      ).stargazers_count ?? 0,
    null,
  );
}
