export function formatCount(value: number): string {
  if (value >= 10_000_000) return `${Math.floor(value / 1_000_000)}M`;
  if (value >= 1_000_000) return formatCompact(value / 1_000_000, 'M');
  if (value >= 10_000) return `${Math.floor(value / 1_000)}K`;
  if (value >= 1_000) return formatCompact(value / 1_000, 'K');
  return `${value}`;
}

function formatCompact(value: number, unit: 'K' | 'M'): string {
  const floored = Math.floor(value * 10) / 10;
  const compact = floored.toFixed(1);
  return `${compact.endsWith('.0') ? compact.slice(0, -2) : compact}${unit}`;
}
