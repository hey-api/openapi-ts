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

export function formatDownloads(downloads: NpmDownloads): string {
  const { count } = downloads;
  const formatted = formatCount(count);
  return formatted;
}

function formatCount(n: number): string {
  if (n >= 10_000_000) return `${Math.floor(n / 1_000_000)}M`;
  if (n >= 1_000_000) return formatCompact(n / 1_000_000, 'M');
  if (n >= 10_000) return `${Math.floor(n / 1_000)}K`;
  if (n >= 1_000) return formatCompact(n / 1_000, 'K');
  return `${n}`;
}

function formatCompact(value: number, unit: 'K' | 'M'): string {
  const floored = Math.floor(value * 10) / 10;
  const compact = floored.toFixed(1);
  return `${compact.endsWith('.0') ? compact.slice(0, -2) : compact}${unit}`;
}
