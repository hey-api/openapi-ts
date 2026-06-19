import { getCached, setCached } from './cache';

export interface NpmDownloads {
  count: number;
  period: 'last-week';
}

export async function fetchWeeklyDownloads(pkg: string): Promise<NpmDownloads | undefined> {
  const key = `npm:downloads:last-week:${pkg}`;
  const cached = getCached<NpmDownloads>(key);
  if (cached !== undefined) return cached ?? undefined;

  try {
    const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`);
    if (!res.ok) {
      setCached(key, null);
      return;
    }
    const data = (await res.json()) as { downloads?: number };
    if (!data.downloads) {
      setCached(key, null);
      return;
    }
    const result: NpmDownloads = { count: data.downloads, period: 'last-week' };
    setCached(key, result);
    return result;
  } catch {
    setCached(key, null);
  }
}
